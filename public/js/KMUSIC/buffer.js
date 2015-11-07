(function(KMUSIC, $, undefined) {

	//////////////////////////////////////////	Buffer
	var Buffer = KMUSIC.Buffer = function (){
		this.buffer = [];
		this.timestamp = 0;
	};

	Buffer.prototype.clean = function (){
		this.buffer = this.buffer.filter(function (note) {
			return note.duration > 0 && note.timestamp >= 0;
		});
	}

	Buffer.prototype.pushNotes = function (noteNumbers, duration, timestamp){
		timestamp = timestamp || this.timestamp;
		duration = duration || 1; //default one beat
		for (var n = 0; n < noteNumbers.length; ++n)
		{
			var noteNumber = noteNumbers[n];
			var note = new Note(noteNumber, duration, timestamp);
			this.buffer.push(note);
			this.timestamp = this.timestamp > note.end() ?
				this.timestamp : note.end();
		}
	}

	//replace current notes;
	//with [] noteNumbers, silence given period
	Buffer.prototype.replaceNotes = function(noteNumbers, duration, timestamp){
		for (var n = 0; n < this.buffer.length; ++n)
		{
			var note = this.buffer[n];

			if (note.timestamp >= timestamp && note.timestamp < (timestamp + duration))
			{
				note.duration -= timestamp + duration - note.timestamp;
				note.timestamp = timestamp + duration;
				if (note.duration < 0)
					note.duration = 0;
			}
			else if (note.end() <= (timestamp + duration) && note.end() > timestamp)
			{
				note.duration -= (note.end()) - timestamp;
				if (note.duration < 0)
					note.duration = 0;
			}
		}
		this.pushNotes(noteNumbers, duration, timestamp);
	}

	Buffer.prototype.splitNotes = function(timestamp) {
		var toPush = [];
		for (var n = 0; n < this.buffer.length; ++n) {			
			var note = this.buffer[n];

			if (note.timestamp > timestamp && note.end() < timestamp) {
				var noteB = new Note(timestamp, note.end() - timestamp);

				toPush.push(noteB);
				note.duration = timestamp - note.timestamp;				
			}
		}
		for (var n = 0; n < toPush.length; ++n) {
			this.buffer.push(toPush(n));
		}
	}

	Buffer.prototype.toOnOffs = function (){
		this.clean();
		var OnOffs = [];
		for (var n = 0; n < this.buffer.length; ++n)
		{
			var note = this.buffer[n];
			OnOffs.push({type : 'on', timestamp : note.timestamp, noteNumber : note.noteNumber});
			OnOffs.push({type : 'off', timestamp : note.timestamp + note.duration, noteNumber : note.noteNumber});
		}
		OnOffs.sort(function(a, b) {
			return a.timestamp > b.timestamp ? 1 : 
				(a.timestamp < b.timestamp ? -1 : 0);
		});
		return OnOffs;
	}


	//helper method to convert to jsmidi MidiEvents
	Buffer.prototype.addToTrack = function(track, beatLength){
 		beatLength = beatLength || 500; //default 0.5 second by beat	
 		var events = this.toOnOffs();
 		var timestamp = 0;
 		for (var n = 0; n < events.length; ++n)
 		{
 			var e = events[n];
 			var delay = (e.timestamp - timestamp) * beatLength;
 			track.addEvent(
 				(e.type === 'on' ?
 				new MidiEvent({time: delay, type: 0x9, // EVT_NOTE_ON,
 					channel: track.channel, param1:  e.noteNumber, param2:  127
    			}) :
 				new MidiEvent({time: delay, type: 0x8, // EVT_NOTE_OFF,
 					channel: track.channel, param1:  e.noteNumber, param2:  127
    			}))

 				);
 			timestamp = e.timestamp;
 		}
	}
	//////////////////////////////////////////



	////////////////////////////////////////// Note
	// an element of a buffer
	var Note = KMUSIC.Note = function (noteNumber, duration, timestamp){
		this.noteNumber = noteNumber;
		this.duration = duration;
		this.timestamp = timestamp;		
	};
	Note.prototype.end = function() {
		return this.duration + this.timestamp;
	}
	//////////////////////////////////////////

} (window.KMUSIC = window.KMUSIC || {}, jQuery));