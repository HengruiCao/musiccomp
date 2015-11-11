
## Demos

* Not published yet

## How to

```
$> npm install
$> npm start
Open a modern browser and go to [localhost:8080](localhost:8080)
```

Or
```
Open public/index.html with a modern browser
```

Hope you can 'enjoy' the 'music'!


## The project

Creates midi file on-the-fly with our random music composition algorithm.
Visualization is using project [Party mode](https://github.com/preziotte/party-mode)

Same seed will give same midi notes in the file
Generation panel can be open-ed by pressing 'r', where you can select instrument-set to be used, change seed, or tempo

Random generated midi file can be downloaded, feel free to download and edit any potential good sounding music!


### Many thanks to the authors of these libraries/projects

* [MIDI.js](https://github.com/mudcube/MIDI.js/): Midi to audio;Supports multiple simultaneous instruments and perfect timing

* [Party mode](https://github.com/preziotte/party-mode): An experimental music visualizer using d3.js and the web audio api.

* [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html): W3C proposal by Chris Rogers
* [jsmid](https://github.com/sergi/jsmidi): Writes MIDI file byte-code.

* [jasmid](https://github.com/gasman/jasmid): Reads MIDI file byte-code, and translats into a Javascript array.

* [MIDI Soundfonts](https://github.com/gleitz/midi-js-soundfonts): Pre-rendered General MIDI soundfonts that can be used immediately with MIDI.js
