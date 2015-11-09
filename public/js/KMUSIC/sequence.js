(function(KMUSIC, $, undefined) {
	var Sequence = KMUSIC.Sequence = function (){
		var _ = this;

		_.measures = [];
	}

	Sequence.generator1 = function (params) {
		measureGenerators = params.generators;
		measureVariations = params.variations;

		var measureLength = params.measureLength || 1;

		var sequenceLength = params.sequenceLength || 2;
		return function (info) {
			var _ = info.sequence = info.sequence || new Sequence();
			var measure = info.measure = new KMUSIC.Measure();
			for (var n = 0; n < measureGenerators.length; ++n) {
				measureGenerators[n](info);
			}

			for (var n = 0; n < sequenceLength; ++n) {
				_.measures.push(measure);
				for (var v = 0; v < measureVariations; ++v) {
					measureVariations[v](info, measure);
				}
			}
			return _;
		}
	}

	Sequence.novariation = function (params) {
		return function (info, sequence) {
			return sequence;
		}
	}

	Sequence.changeSequence = function (params) {
		params = params || {};
		var counter = 0;
		var frequence = params.frequence || 5;
		var sequenceStack = [];
		return function (info, sequence) {
			if (counter == 0) {				
				sequenceStack.push(sequence);
			}
			++counter;	
			if (counter > params.frequence)
			{
				//change to another sequence
				if (info.getRand().next(0, sequenceStack.length) < 2)
				{
					this.sequence = new Sequence();
					for (var n = 0; n < info.sequenceGenerators.length; ++n) {
	    				(info.sequenceGenerators[n])(info);
			    	} //regenerate a sequence
			  		// var new_sequence = this.sequence;

					// this.sequence = sequence;
				}
				else 
				{
					this.sequence = info.getRand().nextElement(sequenceStack);
				}
				counter = 0;
			} 
			return this.sequence;
		}
	}

} (window.KMUSIC = window.KMUSIC || {}, jQuery));