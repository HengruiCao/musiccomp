(function(KMUSIC, $, undefined) {

	////////////////////////////////////////// Range
	//works together with Key, allow play keys within range of midinotes

	var interval = (KMUSIC.Key && KMUSIC.Key.nKeys) || 12;//default 12

	var Range = KMUSIC.Range = function(params){
		this.lowerBound = params.lowerBound || 60; // default C4 60
		this.upperBound = params.upperBound || (this.lowerBound + interval); //default one complete range

		this.getRange = function () {return (this.upperBound - this.lowerBound);}

		this.move = function (dist) {this.lowerBound += dist; this.upperBound += dist;} //move range
	}

	Range.prototype.getNotes = function(keynote) { //get possible midinotes within range
		if (keynote instanceof KMUSIC.Key)
			keynote = keynote.noteNumber;
		var diff = this.lowerBound - keynote;
		var dkey = diff % interval;
		var notes = [];

		var initialnote = (dkey === 0 ? this.lowerBound : (this.lowerBound - dkey));
		for ( ; initialnote <= this.upperBound; initialnote += interval)
		{
			if (initialnote >= this.lowerBound)
			  notes.push(initialnote);
		}
		return notes;
	}

	//////////////////////////////////////////

} (window.KMUSIC = window.KMUSIC || {}, jQuery));