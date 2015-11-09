(function(KMUSIC, $, undefined) {

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
        _.getGamme = function () {return params.generation.gamme;}


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

    		timestamp = KMUSIC.normBeatLength(timestamp);
    		var duration = rand.next(timestamp, 4 - timestamp) - timestamp; //or 4 - timestamp - n?

    		duration = 1.5;
    		timestamp = n * duration;

			buffer.replaceNotes([note], KMUSIC.normBeatLength(duration), timestamp + info.lastTime);
		}
		info.lastTime = 4 + info.lastTime - buffer.timestamp;
    }

    var splitNotes = Info.splitNotes = function(info){
    	var nsplit = 4;
    	var buffer = info.getBuffer();
    	var rand = info.getRand();

    	for (var n = 0; n < nsplit; ++n)
    	{
    		buffer.splitNotes(KMUSIC.normBeatLength(rand.next(0, buffer.timestamp)));
    	}
    }


    Info.rangeMover = function (params) {
        params = params || {};
        params.max = params.max || 5;
        return function (info) {
            var notes = info.getBuffer().buffer;
            var range = info.getRange();

            range.move(info.getRand().nextInt(-params.max, params.max));
        }        
    }

    Info.rangeCenter = function () {
        return function (info) {
            var notes = info.getBuffer().buffer;
            var range = info.getRange();

            var c = 0;
            for (var n = 0; n < notes.length; ++n) {
                c += notes[n].noteNumber;
            }
            range.center(Math.floor(c / notes.length));
        }
    }
  	//////////////////////////////////////////////////////////

} (window.KMUSIC = window.KMUSIC || {}, jQuery));