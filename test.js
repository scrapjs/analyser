var Analyser = require('./');
var Generator = require('audio-generator');
var assert = require('assert');
var almost = require('almost-equal');
var err = 0.1;
var pcm = require('pcm-util');

var analyser = Analyser({
	fftSize: 64
});

analyser.on('data', function (chunk) {
	var floatFreq = this.getFloatFrequencyData(new Float32Array(this.fftSize));
	var floatTime = this.getFloatTimeDomainData(new Float32Array(this.fftSize));
	var byteFreq = this.getByteFrequencyData(new Uint8Array(this.fftSize));
	var byteTime = this.getByteTimeDomainData(new Uint8Array(this.fftSize));
	var freq = this.getFrequencyData();
	var time = this.getTimeData();

	assert(almost(floatFreq[0], freq[0], err, err));
	assert(almost(pcm.convertSample(byteFreq[0], {signed: false, bitDepth: 8}, {float: true}), freq[0], err, err));
	assert.equal(floatFreq.length, freq.length);
	assert.equal(byteFreq.length, freq.length);

	assert(almost(floatTime[0], time[0], err, err));
	assert(almost(pcm.convertSample(byteTime[0], {signed: false, bitDepth: 8}, {float: true}), time[0], err, err));
	assert.equal(floatTime.length, time.length);
	assert.equal(byteTime.length, time.length);
});


Generator({
	generate: function () {
		return Math.random();
	},
	samplesPerFrame: 64,
	duration: 1
})
.pipe(analyser);