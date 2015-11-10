(function(KMUSIC, $, undefined) {
	var Sequence = KMUSIC.Sequence = function (){
		var _ = this;

		_.measures = [];

		_.addToTrack = function (track){
			var timestamp = 0;
			var buffer = new KMUSIC.Buffer();
			for (var n = 0; n < _.measures.length; ++n) {
				var events = _.measures[n].events();
				for (var e = 0; e < events.length; ++e) {
					buffer.pushNotes([events[e].noteNumber],
						events[e].duration, events[e].timestamp + timestamp);
				}
				timestamp += 4;
			}
			buffer.addToTrack(track);
		}
	}

	Sequence.generator1 = function (params) {
		//takes a list of measure generators
		//and repeat the same measure and vary it throughout sequence length

		var measureGenerators = params.generators;
		var measureVariations = params.variations;

		var measureLength = params.measureLength || 1; // How many measures

		var sequenceLength = params.sequenceLength || 2; // How many measures
		return function (info) {
			var _ = info.sequence = info.sequence || new Sequence();

			var measure = info.measure = new KMUSIC.Measure();
			for (var n = 0; n < measureGenerators.length; ++n) {
				measureGenerators[n](info);
			}

			for (var n = 0; n < sequenceLength; ++n) {
				_.measures.push(measure);
				for (var v = 0; v < measureVariations.length; ++v) {
					measure = measureVariations[v](info, measure);
				}
			}
			return _;
		}
	}

	Sequence.novariation = function (params) {
		//as simple as the name implies, this does no changement
		return function (info, sequence) {
			return sequence;
		}
	}

	Sequence.changeSequence = function (params) {
		//this mutation replace current sequence by a stacked sequence
		//Or generate a new one and use it
		params = params || {};
		var counter = 0;
		var frequence = params.frequence || 5;
		var sequenceStack = [];
		return function (info, sequence) {
			if (counter == 0 && sequenceStack.length == 0) {				
				current = info.getRand().nextInt(0, frequence);
				sequenceStack.push(sequence);
			}
			++counter;	
			if (counter > params.frequence)
			{
				//change to another sequence
				if (info.getRand().next(0, sequenceStack.length) < 2)
				{
					info.sequence = new Sequence();
					for (var n = 0; n < info.sequenceGenerators.length; ++n) {
	    				info.sequence = (info.sequenceGenerators[n])(info);
			    	}
					sequenceStack.push(info.sequence);
				}
				else 
				{
					info.sequence = info.getRand().nextElement(sequenceStack);
				}
				counter = 0;
			} 
			return info.sequence;
		}
	}

	Sequence.move = function (params) {
		//this function move up or down existing sequence by rand octave within limit

		params = params || {};
		var counter = 0;
		var frequence = params.frequence || 3;
		var limit = params.limit || 2;
		var moved = 0;
		return function (info, sequence) {
			if (counter >= params.frequence) {
				
				var nsequence = new Sequence(); //to be safe, make a copy of sequenceStack			
				var interval = limit - moved;
				var diff = info.getRand().nextInt(-interval - moved, interval - moved);

				for (var n = 0; n < nsequence.measures.length; ++n) {
					var measure = new Measure(nsequence.measures[n]);

					var events = measure.events();
					for (var i = 0; i < events.length; ++i) {
						events[i].noteNumber += diff * 12;
					}
				}
			}
			++counter;	
			return info.sequence;
		}
	}

	Sequence.changeMeasure = function(params) {
		//This function use given measure generator and regenerate a measure
		return function (info, sequence) {
			var nsequence = new Sequence();

			for (var n = 0; n < nsequence.measures.length; ++n) {

			}
			return nsequence;
		}
	}

} (window.KMUSIC = window.KMUSIC || {}, jQuery));
