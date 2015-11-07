/**
 * Pass-through/sink node analysing data.
 *
 * @module  audio-analyser
 */


var inherits = require('inherits');
var Transform = require('stream').Transform;
var extend = require('xtend/mutable');
var pcm = require('pcm-util');
var fft = require('ndarray-fft');
var ndarray = require('ndarray');
var db = require('decibels/from-gain');
var blackman = require('scijs-window-functions/blackman');


/**
 * @constructor
 */
function Analyser (options) {
	if (!(this instanceof Analyser)) return new Analyser(options);

	var self = this;

	Transform.call(self, options);

	//overwrite options
	extend(self, options);

	//time data buffer
	self._data = [];

	//frequency data
	self._fdata = new Float32Array(self.fftSize);

	//data counters
	self._timeoutCount = 0;
	self._fftCount = 0;
}


/** Inherit transform */
inherits(Analyser, Transform);


/** Get PCM format */
extend(Analyser.prototype, pcm.defaultFormat);


/** Magnitude diapasone, in dB **/
Analyser.prototype.minDecibels = -100;
Analyser.prototype.maxDecibels = 0;


/** Number of points to grab **/
Analyser.prototype.fftSize = 1024;

/** Smoothing */
Analyser.prototype.smoothingTimeConstant = 0.2;

/** Number of points to plot */
Analyser.prototype.frequencyBinCount = 1024/2;

/** Throttle each N ms */
Analyser.prototype.throttle = 50;

/** Size of data to buffer, 1s by default */
Analyser.prototype.bufferSize = 44100;

/** Channel to capture */
Analyser.prototype.channel = 0;

/**
 * Windowing function
 * Same as used by chromium, but can be any from:
 * https://github.com/scijs/window-functions
 */
Analyser.prototype.applyWindow = blackman;


/**
 * Basically pass through
 * but provide small delays to avoid blocking timeouts for rendering
 */
Analyser.prototype._transform = function (chunk, enc, cb) {
	var self = this;
	self.push(chunk);
	self._capture(chunk, cb);
};


/**
 * If pipes count is 0 - don’t stack data
 */
Analyser.prototype._write = function (chunk, enc, cb) {
	var self = this;
	if (!self._readableState.pipesCount) {
		self._capture(chunk, cb);
		//just emulate data event
		self.emit('data', chunk);
	} else {
		Transform.prototype._write.call(this, chunk, enc, cb);
	}
};


/**
 * Capture chunk of data for rendering
 */
Analyser.prototype._capture = function (chunk, cb) {
	var self = this;

	//get channel data converting the input
	var channelData = pcm.getChannelData(chunk, self.channel, self).map(function (sample) {
		return pcm.convertSample(sample, self, {float: true});
	});

	//shift data & ensure size
	self._data = self._data.concat(channelData).slice(-self.bufferSize);

	//increase count
	self._timeoutCount += channelData.length;
	self._fftCount += channelData.length;

	//perform fft, if enough new data
	if (self._fftCount >= self.fftSize) {
		self._fftCount = 0;

		var input = self._data.slice(-self.fftSize);

		//do windowing
		for (var i = 0; i < self.fftSize; i++) {
			input[i] *= self.applyWindow(i, self.fftSize);
		}

		//create complex parts
		var inputRe = ndarray(input);
		var inputIm = ndarray(new Float32Array(self.fftSize));

		//do fast fourier transform
		fft(1, inputRe, inputIm);

		//apply smoothing factor
		var k = Math.min(1, Math.max(self.smoothingTimeConstant, 0));

		//for magnitude imaginary component is blown away. Not necessary though.
		for (var i = 0; i < self.fftSize; i++) {
			self._fdata[i] = k* self._fdata[i] + (1 - k) * Math.abs(inputRe.get(i)) / self.fftSize;
		}
	}

	//meditate for a processor tick each 50ms to let something other happen
	if (self.throttle && self._timeoutCount / self.sampleRate > self.throttle / 1000) {
		self._timeoutCount %= Math.floor(self.sampleRate / self.throttle);
		setTimeout(cb);
	} else {
		cb();
	}

};


/**
 * AudioAnalyser methods
 */
Analyser.prototype.getFloatFrequencyData = function (arr) {
	var self = this;

	if (!arr) return arr;

	var minDb = self.minDecibels, maxDb = self.maxDecibels;

	for (var i = 0, l = Math.min(self.frequencyBinCount, arr.length); i < l; i++) {
		arr[i] = Math.max(db(self._fdata[i]), minDb);
	}

	return arr;
};


Analyser.prototype.getByteFrequencyData = function (arr) {
	var self = this;

	if (!arr) return arr;

	var minDb = self.minDecibels, maxDb = self.maxDecibels;
	var rangeScaleFactor = maxDb === minDb ? 1 : 1 / (maxDb - minDb);

	for (var i = 0, l = Math.min(self.frequencyBinCount, arr.length); i < l; i++) {
		var mg = Math.max(db(self._fdata[i]), minDb);

		//the formula is from the chromium source
		var scaledValue = 255 * (mg - minDb) * rangeScaleFactor;

		arr[i] = scaledValue;
	}

	return arr;
};



Analyser.prototype.getFloatTimeDomainData = function (arr) {
	var self = this;

	if (!arr) return arr;
	var size = Math.min(arr.length, self.fftSize);

	for (var c = 0, i = self._data.length - self.fftSize, l = i + size; i < l; i++, c++) {
		arr[c] = self._data[i];
	}

	return arr;
};


Analyser.prototype.getByteTimeDomainData = function (arr) {
	var self = this;

	if (!arr) return arr;
	var size = Math.min(arr.length, self.fftSize);

	for (var c = 0, i = self._data.length - self.fftSize, l = i + size; i < l; i++, c++) {
		arr[c] = pcm.convertSample(self._data[i], {float: true}, {signed: false, bitDepth: 8});
	}

	return arr;
};


Analyser.prototype.getFrequencyData = function (size) {
	var self = this;
	var result = [];
	var minDb = self.minDecibels, maxDb = self.maxDecibels;

	size = size || self.frequencyBinCount;

	size = Math.min(size, self._fdata.length);

	for (var i = 0; i < size; i++) {
		result.push(Math.max(db(self._fdata[i]), minDb));
	}

	return result;
};


Analyser.prototype.getTimeData = function (size) {
	var result = [];

	size = size || this.fftSize;

	size = Math.min(size, this._data.length);

	return this._data.slice(-size);
};


module.exports = Analyser;