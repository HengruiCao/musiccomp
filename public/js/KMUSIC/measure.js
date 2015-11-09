(function(KMUSIC, $, undefined) {
	var Measure = KMUSIC.Measure = function (measure){
		var _ = this;

		_.buffer = new KMUSIC.Buffer(measure && measure.buffer);
		var events = function () {return _.buffer.buffer;}; //an alias to get buffer of notes
	}

	Measure.generator1 = function (params) {
		params = params || {};
		var durationList = params.durationList || [0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 0.25, 4];
		var balance = params.balance || 0.5;
		var mutateDuration = function (time, rand) {
			var dur = rand.nextElement(durationList);

			while (dur > time) {
		  		dur = dur / 2.0;
			}
			return dur;
		}
		return function (info) {
			var _ = info.measure || new Measure();
			var gamme = info.getGamme();
			var rand = info.getRand();
			var range = info.getRange();

			var note = rand.nextElement(gamme.major_keys);
			var duration = params.startDuration || rand.nextElement(durationList);

			var timeLeft = 4.0;
			while (timeLeft > 0) {
				if (rand.next(0, 1) > balance) {
					//change duration
					duration = mutateDuration(timeLeft, rand);
				} else {
					//change note
					note = rand.nextElement(gamme.major_keys);
				}

   			   	_.buffer.pushNotes(range.getNotes(note), duration);
			   	timeLeft -= duration;
			}
		  }
	}

	Measure.generator2 = function (params) {
		return function (info) {
			
		};
	}


	Measure.variation1 = function (params) {
		params = params || {};
		var variations = params.variations || [2, -2];;
		return function (info, measure) {
			var diff = info.rand.nextElement(variations); //to be coherent with gamme
			var new_measure = new Measure(measure);

			var events = new_measure.events();
			for (var n = 0; n < events.length; ++n) {
				events[n].noteNumber += diff;
			}
			return new_measure;
		} 
	}

	Measure.varyNote = function(params) {
		params = params || {};
		var indexArray = params.indexArray || [-1];
		return function (info, measure) {
			var new_measure = new Measure(measure);
			var rand = info.getRand();

			var notes = new_measure.events()
			var len = notes.length;
			for (var n = 0; n < indexArray.length; ++n) {
				var index = indexArray[n];

				//get valid index;
				while (index < 0 || index >= len)
					index = (index + len) % len;

				var note = notes[index];

				note = rand.nextElement(gamme.major_keys);				
			}
			return new_measure;			
		}
	}

} (window.KMUSIC = window.KMUSIC || {}, jQuery));