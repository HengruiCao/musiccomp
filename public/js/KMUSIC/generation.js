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
            var names2 = ['fire', 'the elements', 'stuff', 'heaven', 'life', 'universe', 'magic', 'logs'];

            var name = r.nextElement(names) + ' ' + r.nextElement(ofs)
                + ' ' + r.nextElement(names2);
            return r.getSeed() + '-' + name + '.mid';
    }

    //////////////////////////////////////////
    var Generation = KMUSIC.Generation = function(params) {
    	this.seed = params.seed || Math.floor(Math.random() * 1000); //otherwise just put a random seed;
    	this.rand = new KMUSIC.Random(this.seed);
    	this.name = params.name || KMUSIC.newMusicName(this.rand); //put a random name;

    	this.gamme = params.gamme || new KMUSIC.Gamme(KMUSIC.Key.midiToKey(this.rand.nextInt(0, 12))); //60 being C4
        this.gamme.isMajor = this.rand.nextInt(0, 1);
        this.gamme.keysUsed = (this.gamme.isMajor) ? this.gamme.major_keys : this.gamme.minor_keys;
        this.tempo = params.tempo || this.rand.nextElement([60, 80, 100, 120, 150, 180]);        
        this.theme = params.theme || this.rand.nextElement(KMUSIC.Theme.List);
    }

    KMUSIC.Info.prototype.addSequence = function (track, totalMeasureLength) {
    	var sequence;
    	for (var n = 0; n < this.sequenceGenerators.length; ++n) {
    		sequence = (this.sequenceGenerators[n])(this);
    	}
    	for (var i = 0; i < totalMeasureLength; i += sequence.measures.length) {

  			sequence.addToTrack(track);

    		//variate sequence
	    	for (var n = 0; n < this.sequenceVariations.length; ++n) {
	    		sequence = this.sequenceVariations[n](this, sequence);
    		}
    		// sequence = this.sequence;
    	}
    }

    Generation.prototype.generateMelodies = function (){
        var nbmelodies = 1; // this.rand.nextInt(1, 3);

        var sequenceNumbers = [1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7,  8];
        
        for (var i = 0; i < nbmelodies; ++i) {
          var track = new MidiTrack({});

          track.channel = i + 1;
          track.setTempo(this.tempo);
          var instrument = this.theme.melody.getInstrument(this.rand);
          track.setMidiInstrument(instrument.name);
    	  track.setVolume(instrument.volume);

    	  var range = new KMUSIC.Range({lowerBound: 36, upperBound: 48}); //24 diff, give more choices
    	  range.move(i % 2 === 0 ? 12 : 0); //move upper

    	  track.info = new KMUSIC.Info({generation: this, range: range, type: 'melody', instrument: instrument});    		
          track.info.instrument = instrument;

          var melodyLength = this.rand.nextElement(sequenceNumbers);

          this.maxMelodyLength = this.maxMelodyLength && this.maxMelodyLength < melodyLength && melodyLength
            || melodyLength;

          track.info.sequenceGenerators = [
                KMUSIC.Sequence.generator1({
	    		generators: [KMUSIC.Measure.generator1()],
	    		variations: [KMUSIC.Measure.melodyContinuation()],
	    		measureLength : 4,  //this.rand.nextInt(1, 4), //can be rand
                coreNote : this.rand.nextInt(60, 90),
                durationFlag : instrument.speed || 0, //speed may not be defined
	    		sequenceLength : melodyLength})
    		];
    	  track.info.sequenceVariations = [
    			KMUSIC.Sequence.changeSequence({
    				frequence : 1
    			}),
        		KMUSIC.Sequence.move({
        			frequence : this.rand.nextInt(2, 5)
        		})
    	  ];
          this.tracks.push(track);
        }
    }
    
    Generation.prototype.generateAccompagnement = function (){
        var nbaccompagnment = this.rand.nextElement([1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4]);

        console.log('accompagnment count ' + (nbaccompagnment + 3));
        this.pauseMult = this.rand.nextInt(0, 4) * this.maxMelodyLength;
        for (var i = 0; i < nbaccompagnment + 3; ++i) {
          var test = new MidiTrack({});

          test.channel = this.tracks.length + 1;
          test.setTempo(this.tempo);
          var instrument = this.theme.accomp.getInstrument(this.rand);        
          var instruName = instrument.name || instrument

          test.setMidiInstrument(instruName);
    	  test.setVolume(instrument.volume);

    	  var range = new KMUSIC.Range({lowerBound: 36, upperBound: 48}); //24 diff, give more choices
    	  range.move(i % 2 === 0 ? 12 : 0); //move upper

    	  test.info = new KMUSIC.Info({generation: this, range: range, type: 'melody'});    		
          test.info.instrument = instrument;

          var chordify = i % 2 === 0;

          // chordify = false;   
          test.pauseFor(this.pauseMult * i);

    	  test.info.sequenceGenerators = [
	      KMUSIC.Sequence.generator1({
	    		generators: [chordify ? KMUSIC.Measure.chordGeneration() : KMUSIC.Measure.generator1({balance : 0.9})],
	    		variations: [KMUSIC.Measure.varyNotes(), chordify ?  KMUSIC.Measure.chordGeneration() : KMUSIC.Measure.move()],
	    		measureLength : 4,  //this.rand.nextInt(1, 4), //can be rand
                        coreNote : this.rand.nextInt(30, 72),
                        durationFlag : instrument.speed || 0, //speed may not be defined
	    		        sequenceLength : this.rand.nextInt(3, 6)})
    		];

    	  test.info.sequenceVariations = [
    			KMUSIC.Sequence.changeSequence({
    				frequence : 1
    			}),
    		        KMUSIC.Sequence.move({
    			frequence : this.rand.nextInt(2, 5)
    		})
    	  ];
    	  this.tracks.push(test);

        }
    }

    Generation.prototype.initialiseTracks = function (){
    	var tracks = this.tracks = [];
        var sequenceNumbers = [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 9]        
        this.generateMelodies();
        this.generateAccompagnement();
        console.log('melody length ' + this.maxMelodyLength);
    }

    Generation.prototype.tracksToData = function() {
    	return MidiWriter({tracks : this.tracks}).b64;
    }

    Generation.prototype.generateMusic = function (){
    	this.rand = new KMUSIC.Random(this.seed);
    	this.initialiseTracks();
    	this.generateMeasure();
    	return {name : this.name, data: 'data:audio/midi;base64,' + this.tracksToData()};
    }

    Generation.prototype.generateMeasure = function(){
    	for (var t = 0; t < this.tracks.length; ++t) {
    		var track = this.tracks[t];
    		var info = track.info;

            var totalMeasureLength = this.maxMelodyLength * this.rand.nextInt(6, 10);

            totalMeasureLength -= this.pauseMult * t;
    		info.addSequence(track, totalMeasureLength);
	    }
    }

    //////////////////////////////////////////


} (window.KMUSIC = window.KMUSIC || {}, jQuery));
