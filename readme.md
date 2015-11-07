Audio analyser stream. Provides API of the [AnalyserNode](https://developer.mozilla.org/en/docs/Web/API/AnalyserNode) for audio-streams. In all respects can be used in the same way.

## Usage

[![npm install audio-analyser](https://nodei.co/npm/audio-analyser.png?mini=true)](https://npmjs.org/package/audio-analyser)

```js
var Analyser = require('audio-analyser');
var Generator = require('audio-generator');


var analyser = new Analyser({
	// Magnitude diapasone, in dB
	minDecibels: -100,
	maxDecibels: -30,

	// Number of time samples to transform to frequency
	fftSize: 1024,

	// Number of frequencies, twice less than fftSize
	frequencyBinCount: 1024/2,

	// Smoothing, or the priority of the old data over the new data
	smoothingTimeConstant: 0.2,

	// Number of channel to analyse
	channel: 0,

	// Size of time data to buffer
	bufferSize: 44100,

	// Windowing function for fft, https://github.com/scijs/window-functions
	applyWindow: function (sampleNumber, totalSamples) {
	}

	//...pcm-stream params, if required
});


//AnalyserNode methods

// Copies the current frequency data into a Float32Array array passed into it.
analyser.getFloatFrequencyData(arr);

// Copies the current frequency data into a Uint8Array passed into it.
analyser.getByteFrequencyData(arr);

// Copies the current waveform, or time-domain data into a Float32Array array passed into it.
analyser.getFloatTimeDomainData(arr);

// Copies the current waveform, or time-domain data into a Uint8Array passed into it.
analyser.getByteTimeDomainData(arr);


//Shortcut methods

//return array with frequency data in decibels of size <= fftSize
analyser.getFrequencyData(size);

//return array with time data of size <= self.bufferSize (way more than fftSize)
analyser.getTimeData(size);


//Can be used both as a sink or pass-through
Generator().pipe(analyser);
```

## Related

> [audio-render](https://npmjs.org/package/audio-render) — render audio streams.<br/>
> [audio-spectrum](https://npmjs.org/package/audio-spectrum) — render audio spectrum.<br/>
> [audio-spectrogram](https://npmjs.org/package/audio-spectrogram) — render audio spectrogram.<br/>
> [audio-waveform](https://npmjs.org/package/audio-waveform) — render audio waveform.<br/>
> [audio-stat](https://npmjs.org/package/audio-stat) — render any kind of audio info: waveform, spectrogram etc.<br/>
> [pcm-util](https://npmjs.org/package/pcm-util) — utils for work with pcm-streams.<br/>
> [ndarray-fft](https://github.com/scijs/ndarray-fft) — implementation of fft for ndarrays.<br/>