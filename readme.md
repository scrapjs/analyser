Audio analyser stream. Provides API of the [AnalyserNode](https://developer.mozilla.org/en/docs/Web/API/AnalyserNode) for audio-streams. In all respects can be used in the same way.

## Usage

[![npm install audio-analyser](https://nodei.co/npm/audio-analyser.png?mini=true)](https://npmjs.org/package/audio-analyser)

```js
import Analyser from 'audio-analyser';
import Generator fomr 'audio-generator';


var analyser = new Analyser({
	/** Magnitude diapasone, in dB **/
	minDecibels: -90,
	maxDecibels: -30,

	/** Number of points to grab **/
	fftSize: 1024,

	/** Number of points to plot */
	frequencyBinCount: 1024/2,

	/** Smoothing, or the priority of the old data over the new data */
	smoothingTimeConstant: 0.2

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

//return array with frequency data of size <= fftSize
analyser.getFrequencyData(size);

//return array with time data of size <= self.bufferSize (way more than fftSize)
analyser.getTimeData(size);


Generator().pipe(analyser);
```

## Related

> [AnalyserNode](https://developer.mozilla.org/en/docs/Web/API/AnalyserNode) — web-audio-api analyser node.<br/>
> [audio-render](https://npmjs.org/package/audio-render) — wrapper of analyser node, providing cross-platform utilities for rendering streams.<br/>
> [audio-spectrum](https://npmjs.org/package/audio-spectrum) — render audio spectrum.<br/>
> [audio-spectrogram](https://npmjs.org/package/audio-spectrogram) — render audio spectrogram.<br/>
> [audio-waveform](https://npmjs.org/package/audio-waveform) — render audio waveform.<br/>
> [audio-stat](https://npmjs.org/package/audio-stat) — render any kind of audio info: waveform, spectrogram etc.<br/>
> [pcm-util](https://npmjs.org/package/pcm-util) — utils for work with pcm-streams.<br/>
> [ndarray-fft](https://github.com/scijs/ndarray-fft) — implementation of fft for ndarrays.<br/>