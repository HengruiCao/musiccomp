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

    	this.gamme = params.gamme || new KMUSIC.Gamme(KMUSIC.Key.midiToKey(60)); //60 being C4
        this.gamme.isMajor = this.rand.nextInt(0, 1);
        this.gamme.keysUsed = (this.gamme.isMajor) ? this.gamme.major_keys : this.gamme.minor_keys;
    }
    KMUSIC.Info.prototype.addSequence = function (track, totalMeasureLength) {
    	var sequence;
    	for (var n = 0; n < this.sequenceGenerators.length; ++n) {
    		sequence = (this.sequenceGenerators[n])(this);
    	}
    	var len = sequence.measures.length;
    	for (var i = 0; i < totalMeasureLength; i += len) {

    		for (var a = 0; a < len; ++a) {
    			//sequence.measures[a].buffer.addToTrack(track); //both methods have same effect
    		}
  			sequence.addToTrack(track);

    		//variate sequence
	    	for (var n = 0; n < this.sequenceVariations.length; ++n) {
	    		sequence = this.sequenceVariations[n](this, sequence);
    		}
    		// sequence = this.sequence;
    	}
    }    

    Generation.prototype.initialiseTracks = function (){
    	var tracks = this.tracks = [];
    	var ntracks = 6; //can have random here;
        this.tempo = this.rand.nextElement([60, 70, 80, 90, 100, 120, 150, 180])
        console.log('tempo ' + this.tempo);
        //this.createDuration();

    	var instruments = ['trumpet', 'acoustic_grand_piano', 'flute', 'guitar_harmonics', 'tuba'];
        var sequenceNumbers = [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 9]

    	for (var n = 0; n < ntracks; ++n) {
    		var track = new MidiTrack({});

    		track.channel = n;
    		track.setTempo(this.tempo);
    		track.setMidiInstrument(this.rand.nextElement(instruments));
    		track.setVolume(10);
    		//starting range set of a track
    		// var range = new Range({lowerBound: 24 + 24 *(n + 1)});
    		var range = new KMUSIC.Range({lowerBound: 36, upperBound: 48}); //24 diff, give more choices
    		//
    		range.move(n % 2 === 0 ? 12 : 0); //move upper

    		track.info = new KMUSIC.Info({generation: this, range: range});    		
    		this.tracks.push(track);


    		track.info.sequenceGenerators = [
	    		KMUSIC.Sequence.generator1({
	    			generators: [KMUSIC.Measure.generator1(n % 2 === 0 ? {} : {durationList: [1, 2, 2, 2, 4]})],
	    			variations: [KMUSIC.Measure.move(), KMUSIC.Measure.varyNotes()],
	    			measureLength : this.rand.nextInt(1, 4), //can be rand
	    			sequenceLength : this.rand.nextElement(sequenceNumbers)})
    			];
    		track.info.sequenceVariations = [
    			KMUSIC.Sequence.changeSequence({
    				frequence : this.rand.nextInt(1, 2)
    			}),
    			KMUSIC.Sequence.move({
    			frequence : this.rand.nextInt(2, 5)
    			})
    		];
    	}
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
    				frequence : 1
    			}),
    		KMUSIC.Sequence.move({
    			frequence : this.rand.nextInt(2, 5)
    		})
    	];
    	console.log(tracks);
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

    		info.addSequence(track, 40);
	    }
    }

    //////////////////////////////////////////


} (window.KMUSIC = window.KMUSIC || {}, jQuery));
