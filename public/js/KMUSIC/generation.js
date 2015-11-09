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
	var normBeatLength = KMUSIC.normBeatLength = function(timestamp, mult) {
		//deprecated
        mult = mult || 4;
        timestamp = Math.round(timestamp * mult) / mult;
        return timestamp;
    }

    var Generation = KMUSIC.Generation = function(params) {
    	this.seed = params.seed || Math.floor(Math.random() * 1000); //otherwise just put a random seed;
    	this.rand = new KMUSIC.Random(this.seed);
    	this.name = params.name || KMUSIC.newMusicName(this.rand); //put a random name;

    	this.gamme = params.gamme || new KMUSIC.Gamme(KMUSIC.Key.midiToKey(60)); //60 being C4
        this.gamme.isMajor = this.rand.nextInt(0, 1);
        this.gamme.keysUsed = (this.gamme.isMajor) ? this.gamme.major_keys : this.gamme.minor_keys;
    }

    var pushDuration = function(info) {
        var buffer = info.getBuffer();
        for (var i = 0; i < info.duration.length; ++i) {
            console.log(i);
            console.log(info.duration[i]);
            for (var j = 0; j < info.duration[i].length; ++j) {
	      buffer.pushNotes([info.melody[i][j]], info.duration[i][j]);
	      //buffer.pushNotes(64, info.duration[i][j]);
            }
        }
    }

    var pushMelody = function(info) {
	//buffer.pushNotes([0], info.duration[i] * beatDuration * 50);
    }
    
    Generation.prototype.createDuration = function() {
      var melodyLength = this.rand.nextElement([1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 6, 7, 8]);
      var duration = [];
      var melody = [];
      var startNote = this.rand.nextInt(MIDI.keyToNote['C3'], MIDI.keyToNote['C6']);
      var tmpNote = startNote;
  
      for (var mesure = 0; mesure < melodyLength; mesure++) {
        var durationMesure = [];
        var melodyMesure = [];
        var timeLeft = 4.0;
        
        while (timeLeft != 0) {
          var dice = this.rand.nextElement([0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 0.25, 4]);

          while (dice > timeLeft) {
            dice = dice / 2.0;
          }
          durationMesure[durationMesure.length] = dice;
          timeLeft -= dice;

          var dice = this.rand.nextInt(-1, 1);

          melodyMesure[melodyMesure.length] = dice + tmpNote;
          tmpNote += dice;
          if (tmpNote > startNote + 12 || tmpNote < startNote - 12)
            tmpNote = startNote;

        }
        duration[duration.length] = durationMesure;
        melody[melody.length] = melodyMesure;
      }
      this.duration = duration;
      this.melody = melody;
    }

    Generation.prototype.createMelody = function() {

    };
        

    KMUSIC.Info.prototype.addSequence = function (track, totalMeasureLength) {
    	for (var n = 0; n < this.sequenceGenerators.length; ++n) {
    		(this.sequenceGenerators[n])(this);
    	}
    	var sequence = this.sequence;
    	var len = sequence.measures.length;
    	console.log(len);
    	for (var i = 0; i < totalMeasureLength; i += len) {

    		for (var a = 0; a < len; ++a) {
    			sequence.measures[a].buffer.addToTrack(track);
    		}

    		//variate sequence
	    	for (var n = 0; n < this.sequenceVariations.length; ++n) {
	    		this.sequenceVariations[n](this, sequence);
    		}
    		sequence = this.sequence;
    	}
    }    

    Generation.prototype.initialiseTracks = function (){
    	var tracks = this.tracks = [];
    	var ntracks = 3; //can have random here;
        this.tempo = this.rand.nextInt(60, 150);
        console.log('tempo' + this.tempo);
        //this.createDuration();

    	var instruments = ['trumpet', 'acoustic_grand_piano', 'flute', 'guitar_harmonics', 'tuba'];
        var sequenceNumbers = [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 9]

    	for (var n = 0; n < ntracks; ++n) {
    		var track = new MidiTrack({});

    		track.channel = n;
    		track.setTempo(this.tempo);
    		track.setMidiInstrument(this.rand.nextElement(instruments));
    		track.setVolume(127);
    		//starting range set of a track
    		// var range = new Range({lowerBound: 24 + 24 *(n + 1)});
    		var range = new KMUSIC.Range({lowerBound: 24 + 24 * 1, upperBound: 24 * 2 + 24 *1}); //24 diff, give more choices
    		//

    		track.info = new KMUSIC.Info({generation: this, range: range});    		
    		this.tracks.push(track);


    		track.info.sequenceGenerators = [
	    		KMUSIC.Sequence.generator1({
	    			generators: [KMUSIC.Measure.generator1()],
	    			variations: [KMUSIC.Measure.variation1(), KMUSIC.Measure.varyNote()],
	    			measureLength : this.rand.nextInt(1, 4), //can be rand
	    			sequenceLength : this.rand.nextElement(sequenceNumbers)})
    			];
    		track.info.sequenceVariations = [
    			KMUSIC.Sequence.changeSequence({
    				frequence : this.rand.nextInt(2, 5)
    			})
    		];
    	}
    	//set handlers
    	// tracks[0].info.addHandlers([pushChords])
    	// tracks[1].info.addHandlers([seqChords, splitNotes]);

    		tracks[0].setMidiInstrument('bright_acoustic_piano');
    		tracks[0].info.sequenceGenerators = [
	    		KMUSIC.Sequence.generator1({
	    			generators: [KMUSIC.Measure.generator1()],
	    			variations: [KMUSIC.Measure.melodyContinuation()],
	    			measureLength : this.rand.nextInt(1, 4), //can be rand
	    			sequenceLength : this.rand.nextElement(sequenceNumbers)})
    			];
    		tracks[0].info.sequenceVariations = [
    			KMUSIC.Sequence.changeSequence({
    				frequence : this.rand.nextInt(2, 5)
    			})
    		];
/*
        tracks[0].setMidiInstrument('bright_acoustic_piano');
        tracks[0].info.duration = this.duration;
        tracks[0].info.melody = this.melody;
        tracks[0].info.addHandlers([pushDuration]);
*/
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
    	//console.log(this.tracks);
    	return {name : this.name, data: 'data:audio/midi;base64,' + this.tracksToData()};
    }

    Generation.prototype.generateMeasure = function(){
    	for (var t = 0; t < this.tracks.length; ++t) {
    		var track = this.tracks[t];
    		var info = track.info;

    		info.addSequence(track, 40);
	    }
    }

    //////////////////////////////////////////


} (window.KMUSIC = window.KMUSIC || {}, jQuery));
