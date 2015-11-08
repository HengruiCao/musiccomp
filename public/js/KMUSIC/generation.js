(function(KMUSIC, $, undefined) {

	var Random = KMUSIC.Random = function (seed, r){ //r with implementation of next(min, max)
		var algo = r || CustomRandom(seed); //see CustomRandom for implementation
		this.seed = seed;

		this.next = algo.next;
		this.nextInt = function (min, max) {return Math.floor(this.next(min, max));};
		this.nextElement = function(ary) {return ary[this.nextInt(0, ary.length)];};
		this.getSeed = function() {return seed;};
	};


	////////////////////////////////////////// Music Name

	var newMusicName = KMUSIC.newMusicName = function (r){
            var names = ['risk', 'path', 'music', 'fog', 'sunshine', 'rythm', 'tale', 'chuck norris'];
            var ofs = ['of', 'into', 'to', 'from']
            var names2 = ['fire', 'the elements', '', 'heaven', 'life', 'universe', 'magic', 'logs'];

            var name = r.nextElement(names) + ' ' + r.nextElement(ofs)
                + ' ' + r.nextElement(names2);
            return r.getSeed() + '-' + name + '.mid';
    }

	//////////////////////////////////////////

	var newMusicSong = KMUSIC.newMusicSong = function (seed){
        var r = new KMUSIC.Random(seed);

        function escalatorPattern(mainMelody) {
            var note = mainMelody[mainMelody.length - 1];
            var length = 5 + Math.random() % 20;

            for (var i = 0; i < length; i++) {
              mainMelody[mainMelody.length] = note + (i % 2) ? - i / 2 + 1 : i / 2 + 1;
            }
        };

        function newMusicData(){
            var tracks = [];

            tracks[0] = new MidiTrack({});//just gonna put the tempo here
            // tracks[0].setTempo(120);
            // tracks[0].setTrackName('Meta track');

            tracks[1] = new MidiTrack({});
            tracks[1].channel = 1;
            tracks[1].setMidiInstrument('electric_bass_pick');
            tracks[2] = new MidiTrack({});
            tracks[2].channel = 2;
            tracks[2].setMidiInstrument('trumpet');

            var note = MIDI.keyToNote['C4'];
            for (var i = 0; i < 16; ++i)
            {
                var key = getKeys(note);
                var maj_chord = r.nextElement(getChords(note).major_chord);
                var duration = 200;

                function addChord(track, chord) {
                $.each(chord, function (idx, notekey){
                    track.addEvent(MidiEvent.noteOn({pitch : notekey, volume : 127, channel : track.channel}));
                });
                $.each(chord, function (idx, notekey){
                    track.addEvent(MidiEvent.noteOff({pitch : notekey, volume : 127, channel : track.channel}, ((idx === 0) ? duration : 0)));
                });                    
                }

                $.each(maj_chord, function (idx, notekey) {
                    tracks[1].addEvent(MidiEvent.noteOn({pitch : notekey, volume : 127, channel : 1}, ((idx === 0) ? duration / 4: 0)));
                    tracks[1].addEvent(MidiEvent.noteOff({pitch : notekey, volume : 127, channel : 1}, duration / 4));                    
                });
                console.log(maj_chord);
                addChord(tracks[2], maj_chord);
                // note = r.nextElement([key.nextFifth, key.prevFifth, note, note]);
            }
            return MidiWriter({tracks : tracks}).b64;
        }        
        return {name: KMUSIC.newMusicName(r), data: 'data:audio/midi;base64,' + newMusicData()};
    }
    //////////////////////////////////////////
	
	//this function should belong to timestamp though
	//floor to the closest n-th beat (eg, 0.25 --- 4)
	var normBeatLength = function(timestamp, mult) {
		mult = mult || 4;
		timestamp = Math.round(timestamp * mult) / mult;
                timestamp = timestamp * (60000 / (128 * 20));
		return timestamp;
	}

    var Generation = KMUSIC.Generation = function(params) {
    	this.seed = params.seed || Math.floor(Math.random() * 1000); //otherwise just put a random seed;
    	this.rand = new KMUSIC.Random(this.seed);
    	this.name = params.name || KMUSIC.newMusicName(this.rand); //put a random name;

    	this.gamme = params.gamme || new KMUSIC.Gamme(KMUSIC.Key.midiToKey(60)); //60 being C4
    }

    //////////////////////////////////////////////////////// possible playouts
    //info contain global info, like gamme, chords, cidx etc

    //helper for generation param storing
    //e.g. one info by track
    var Info = KMUSIC.Info = function(params) {
    	var _ = this;

    	_.range = new KMUSIC.Range(params.range);
    	_.handlers = [];
    	// _.buffer = new KMUSIC.Buffer();
    	_.getChord = function () {return _.chord;}
    	_.getRange = function (){return _.range;}
    	_.getBuffer = function () {return _.buffer;}
    	_.getGlobals = function () {return params.generation;}
    	_.getRand = function () {return params.generation.rand;}

    	_.createBuffer = function (buffer) { //if buffer passed as param, then use existing buffer
    		_.buffer = buffer || new KMUSIC.Buffer();
    		for (var n = 0; n < _.handlers.length; ++n) {
    			(_.handlers[n])(this);
    		}
    		return _.buffer;
    	}
    	_.addHandlers = function (hs){
    		for (var n = 0; n < hs.length; ++n) {
	    		_.handlers.push(hs[n]);
    		}
    	}
    }

    var pushMelody = function(info) {

        var buffer = info.getBuffer();
        for (var i = 0; i < info.melody.length; i++) {
          var noteToPress = info.melody[i];
          console.log(info.tempo);

          var beatDuration = Math.floor(60000 / ( 128 * info.tempo));
	  buffer.pushNotes([noteToPress],info.duration[i] * beatDuration);    	
        }
	//buffer.pushNotes([0], info.duration[i] * beatDuration * 50);    	


    }

    var pushChords = Info.pushChords = function(info) {
    	var chord = info.getChord();
    	var range = info.getRange();
    	var buffer = info.getBuffer();
    	//Range
    	var chordToPress = [];
    	for (var n = 0; n < chord.length; ++n) {
    		var possible = range.getNotes(chord[n]);
    		chordToPress.push(info.getRand().nextElement(possible));
    	}
		buffer.pushNotes(chordToPress, 4);    	
    }
    var seqChords = Info.seqChords = function(info) {
    	var chord = info.getChord();
    	var range = info.getRange();
    	var rand = info.getRand();
    	var buffer = info.getBuffer();
    	info.lastTime = info.lastTime || 0;

    	//Range
    	var chordToPress = [];
		for (var n = 0; n < chord.length; ++n)
		{
    		var possible = range.getNotes(chord[n]);
    		var note = info.getRand().nextElement(possible);
    		var timestamp = (n === 0 ? 0 : rand.next(n * 0.25, 4 - (chord.length - n) * 0.25));

    		timestamp = normBeatLength(timestamp);
    		var duration = rand.next(timestamp, 4 - timestamp) - timestamp; //or 4 - timestamp - n?

    		duration = 1.5;
    		timestamp = n * duration;

			buffer.replaceNotes([note], normBeatLength(duration), timestamp + info.lastTime);
		}
		info.lastTime = 4 + info.lastTime - buffer.timestamp;
    }


    var splitNotes = Info.splitNotes = function(info){
    	var nsplit = 4;
    	var buffer = info.getBuffer();
    	var rand = info.getRand();

    	for (var n = 0; n < nsplit; ++n)
    	{
    		buffer.splitNotes(normBeatLength(rand.next(0, buffer.timestamp)));
    	}
    }
  	//////////////////////////////////////////////////////////

    Generation.prototype.createMelodyStars = function(len, mainMelody, note) {
      var length = this.rand.nextInt(3, 7);
      var startDirect = this.rand.nextInt(0, 1);
      startDirect = (startDirect) ? -1 : 1;
      
      for (var i = 0; i < length; i++) {
        var direct = (i % 2) ? startDirect : -startDirect;
        var nb = 1 + i / 2;
        mainMelody[len + i + 1] = note + direct * nb;
        this.duration[len + i + 1] = 1;
      }
      return length - 1;
    }

    Generation.prototype.createMelody = function() {

            var mainMelody = [];
            this.duration = [];

            var note = this.rand.nextInt(MIDI.keyToNote['C3'], MIDI.keyToNote['C5']);
            mainMelody[0] = note;
            var noteRange = 12;
            var original = note;
            var length = this.rand.nextInt(13, 20);
            this.tempo = this.rand.nextInt(40, 70);

            for (var i = 0; i < length; i++) {
              var choice = this.rand.nextInt(1, 7);
              var evolution = this.rand.nextInt(0, 1);
              var tmp = 0;
              this.duration[i] = this.rand.nextInt(1,4);
              evolution = (evolution) ? -1 : 1;
              switch (choice) {
                case 2:
                  tmp = 1 * evolution;
                  break;
                case 3:
                  tmp = 2 * evolution;
                  break;
                case 4:
                  tmp = 5;
                  break;
                case 5:
                  tmp = 7;
                  break;
                case 6:
                  tmp = original;
                  i += this.createMelodyStars(i, mainMelody, mainMelody[i]);
                  break;
                case 7:
                  tmp = 12;
                  break;
              }
              if (choice != 6  && choice > 3 && evolution)
                tmp = -tmp;
              if (choice != 6)
                tmp += mainMelody[i];
              if (tmp != 6 && tmp > original + noteRange)
                tmp = original;
              mainMelody[i + 1] = Math.round(tmp);
            }

            return mainMelody;


    };
        
    Generation.prototype.initialiseTracks = function (){
    	var tracks = this.tracks = [];
    	var ntracks = 3; //can have random here;
        this.tempo = this.rand.nextInt(60, 150);
        console.log(this.tempo);
        this.melody = this.createMelody();
        console.log("MELODY")
        console.log(this.melody);
        console.log(this.duration);

    	var instruments = ['trumpet', 'acoustic_grand_piano', 'cello', 'violin', 'flute', 'guitar_harmonics', 'tuba'];

    	for (var n = 0; n < ntracks; ++n) {
    		var track = new MidiTrack({});

    		track.channel = n;
    		track.setMidiInstrument(this.rand.nextElement(instruments));

    		//starting range set of a track
    		// var range = new Range({lowerBound: 24 + 24 *(n + 1)});
    		var range = new Range({lowerBound: 24 + 24 *(n + 1), upperBound: 24 * 2 + 24 *(n + 1)}); //24 diff, give more choices
    		//

    		track.info = new Info({generation: this, range: range});    		
    		this.tracks.push(track);
    	}

    	//set handlers
        tracks[2].info.melody = this.melody;
        tracks[2].info.tempo = this.tempo;
        tracks[2].info.duration = this.duration;
        tracks[2].setMidiInstrument('violin');

        tracks[2].info.addHandlers([pushMelody]);
    	//tracks[0].info.addHandlers([pushChords]);
    	//tracks[1].info.addHandlers([seqChords, splitNotes]);
    	// tracks[2].info.addHandlers([seqChords, splitNotes]);
    }

    Generation.prototype.tracksToData = function() {
    	return MidiWriter({tracks : this.tracks}).b64;
    }

    Generation.prototype.generateMusic = function (){
    	this.rand = new KMUSIC.Random(this.seed);
    	this.initialiseTracks();
    	this.generateMeasure();
    	console.log(this.tracks);
    	return {name : this.name, data: 'data:audio/midi;base64,' + this.tracksToData()};
    }

    Generation.prototype.generateChords = function(nchords) {
    	//no change gamme
    	//use major_chordsi
    	var pchords = this.gamme.major_chords;
    	var chords = [];
    	for (var n = 0; n < nchords; ++n)
    	{
    		chords.push(this.rand.nextElement(pchords));
    	}
    	return chords;
    }

    Generation.prototype.generateMeasure = function(){
    	var chords = this.generateChords(16); //need another upper layer

    	for (var n = 0; n < chords.length; ++n) {
    		var chord = chords[n];

    		for (var t = 0; t < this.tracks.length; ++t) {
    			var track = this.tracks[t];

    			//randomly change range
    			track.info.range.move(this.rand.nextInt(-5, 5));

    			track.info.chord = chord;

    			var buffer = track.info.createBuffer();

                        var beatDuration = Math.floor(60000 / (16 * this.tempo));

    			buffer.addToTrack(track, beatDuration);
    		}
    	}
    }

    //////////////////////////////////////////


} (window.KMUSIC = window.KMUSIC || {}, jQuery));
