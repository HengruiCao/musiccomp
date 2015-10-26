// Annalyze Midifile
// This as parameter
// {
// 		'header': header,
// 		'tracks': tracks
// 	}

var NoteSequence = function(midifile){
	var _ = this;

	_.midifile = midifile;

	_.getTicksPerBeat = function(){
		return _.midifile.ticksPerBeat;
	}

	var Status = function(header){
		this.ticksPerBeat = header.ticksPerBeat;
		this.sequences = {};
		this.currentInstrument = 0;
		this.currentTick = 0;
		this.microsecondsPerBeat = 0;
		this.changeInstrument = function(programNumber){
			this.currentInstrument = programNumber;
		}
		this.addNote = function(noteEvent, trackNum){
			if (this.sequences[this.currentInstrument] == null)
				this.sequences[this.currentInstrument] = {};
			if (this.sequences[this.currentInstrument][trackNum] == null)
				this.sequences[this.currentInstrument][trackNum] = [];
			var note = {
				startTime : this.currentTick,
				endTime : this.currentTick,
				noteNumber : noteEvent.noteNumber,
				velocity : noteEvent.velocity,
			}
			this.sequences[this.currentInstrument][trackNum].push(note);
		}
		this.offNote = function(noteEvent, trackNum){
			if (this.sequences[this.currentInstrument] != null
				&& this.sequences[this.currentInstrument][trackNum] != null)
			{
				var sequence = this.sequences[this.currentInstrument][trackNum];
				for (var i = sequence.length - 1; i >= 0; --i)
				{
					if (sequence[i].noteNumber == noteEvent.noteNumber)
					{
						sequence[i].endTime = this.currentTick;
						break;
					}
				}
			}
		}

	}

	_.getSequence = function(){
		var status = new Status(_.midifile.header);
		for (var trackNum = 0; trackNum < midifile.tracks.length; ++trackNum)
		{
			var track = midifile.tracks[trackNum];
			status.currentTick = 0; //each track start at 0

			for (var eventNum = 0; eventNum < track.length; ++eventNum)
			{
				var trackEvent = track[eventNum];
				status.currentTick += trackEvent.deltaTime;
				switch (trackEvent.subtype) {
					case 'programChange':
						status.changeInstrument(trackEvent.programNumber);
						break;
					case 'noteOn':
						if (trackEvent.velocity != 0)
							status.addNote(trackEvent, trackNum);
						break;
					case 'noteOff':
						status.offNote(trackEvent, trackNum);
						break;
					default:
						//Other types may or not be useful
						break;
				}
			}
		}
		return status;
	}
}

var RequestMidi = function(file, callback){
	var onerror = console.log;

	//From midijs player.js
	if (file.indexOf('base64,') !== -1) {
		var data = window.atob(file.split(',')[1]);
		callback(data);
	} else {
		var fetch = new XMLHttpRequest();
		fetch.open('GET', file);
		fetch.overrideMimeType('text/plain; charset=x-user-defined');
		fetch.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					var t = this.responseText || '';
					var ff = [];
					var mx = t.length;
					var scc = String.fromCharCode;
					for (var z = 0; z < mx; z++) {
						ff[z] = scc(t.charCodeAt(z) & 255);
					}
					var data = ff.join('');

					callback(data);
				} else {
					onerror && onerror('Unable to load MIDI file');
				}
			}
		};
		fetch.send();
	}
}

var TransitionAnnalyse = function (sequence, ticksPerBeat, correction){
	function TickToUnitBeat(duration, ticksPerBeat){
		return Math.ceil(duration / (ticksPerBeat / 32)); //lets say least beat being 32
	}

	if (correction == null)
		correction = true;

	var status = {
		note : {},
		duration : {},
		noteObj : {}
	};
	for (var i = 0; i < sequence.length; ++i)
	{
		var note = sequence[i];
		var noteNumber = MIDI.noteToKey[note.noteNumber];
		var duration = note.endTime - note.startTime;
		if (correction && duration % (ticksPerBeat / 32) != 0)
		{
			for (var j = i + 1; j < sequence.length; ++j)
			{
				if (sequence[j].startTime >= note.endTime)
				{				
					duration = sequence[j].startTime - note.startTime;
					break ;
				}
			}
		}
		var beatLength = TickToUnitBeat(duration, ticksPerBeat);
		var noteObj = {
			noteNumber : noteNumber, beatLength : beatLength,
			toString : function() {return this.noteNumber.toString() + " " + beatLength;}
		};
		if (status.current != null)
		{
			var prev = status.current;
			//save transition
			status.note[prev.noteNumber] || (status.note[prev.noteNumber] = {});
			status.note[prev.noteNumber][noteNumber] || (status.note[prev.noteNumber][noteNumber] = 0);
			status.note[prev.noteNumber][noteNumber] += 1;

			status.duration[prev.beatLength] || (status.duration[prev.beatLength] = {});
			status.duration[prev.beatLength][beatLength] || (status.duration[prev.beatLength][beatLength] = 0);
			status.duration[prev.beatLength][beatLength] += 1;

			status.noteObj[prev] || (status.noteObj[prev] = []);
			status.noteObj[prev].push(noteObj);

		}
		status.current = noteObj;
		// if (i > 100)
		// 	break ;
	}
	return status;
}