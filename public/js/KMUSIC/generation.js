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
	var normBeatLength = KMUSIC.normBeatLength = function(timestamp, mult) {
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

    var pushDuration = function(info) {
        var buffer = info.getBuffer();
        for (var i = 0; i < info.duration.length; ++i) {
            console.log(i);
            console.log(info.duration[i]);
            for (var j = 0; j < info.duration[i].length; ++j) {
	      buffer.pushNotes([67], info.duration[i][j]);
            }
        }
        console.log(info.duration);
        console.log(buffer);
    }

    var pushMelody = function(info) {
	//buffer.pushNotes([0], info.duration[i] * beatDuration * 50);
    }
    
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

    Generation.prototype.createDuration = function() {
      var melodyLength = 1;
      var duration = [];
      
      for (var mesure = 0; mesure < melodyLength; mesure++) {
        var durationMesure = [];
        var timeLeft = 4.0;
        
        while (timeLeft != 0) {
          var dice = this.rand.nextElement([0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 0.25, 4]);

          while (dice > timeLeft) {
            dice = dice / 2.0;
          }
          durationMesure[durationMesure.length] = dice;
          timeLeft -= dice;
        }
        duration[duration.length] = durationMesure;
      }
      this.duration = duration;
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
        this.createDuration();

    	var instruments = ['trumpet', 'acoustic_grand_piano', 'cello', 'violin', 'flute', 'guitar_harmonics', 'tuba'];

    	for (var n = 0; n < ntracks; ++n) {
    		var track = new MidiTrack({});

    		track.channel = n;
    		track.setTempo(150);
    		track.setMidiInstrument(this.rand.nextElement(instruments));
    		track.setVolume(127);
    		//starting range set of a track
    		// var range = new Range({lowerBound: 24 + 24 *(n + 1)});
    		var range = new KMUSIC.Range({lowerBound: 24 + 24 *(n + 1), upperBound: 24 * 2 + 24 *(n + 1)}); //24 diff, give more choices
    		//

    		track.info = new KMUSIC.Info({generation: this, range: range});    		
    		this.tracks.push(track);
    	}
    	//set handlers
    	// tracks[0].info.addHandlers([pushChords])
    	// tracks[1].info.addHandlers([seqChords, splitNotes]);

        tracks[0].setMidiInstrument('bright_acoustic_piano');
        tracks[0].info.duration = this.duration;
        tracks[0].info.addHandlers([pushDuration]);

    	//tracks[0].info.addHandlers([pushChords]);
    	//tracks[1].info.addHandlers([seqChords, splitNotes]);
    	// tracks[2].info.addHandlers([seqChords, splitNotes]);

    	//handlers
    	//tracks[0].info.addHandlers([KMUSIC.Info.pushChords, KMUSIC.Info.rangeMover()]);
    	//tracks[1].info.addHandlers([KMUSIC.Info.seqChords, KMUSIC.Info.splitNotes, KMUSIC.Info.rangeCenter()]);
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

    			buffer.addToTrack(track, 128);
		    	console.log(this.tracks);
		    	break;
    		}
    		break ;
    	}
    }

    //////////////////////////////////////////


} (window.KMUSIC = window.KMUSIC || {}, jQuery));
