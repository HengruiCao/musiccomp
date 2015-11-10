(function(KMUSIC, $, undefined) {

	//extend existing jsmidi miditrack
	MidiTrack.prototype.addMidiNote = function (note) {
        //deprecated
        note.channel = this.channel;
        notes = MidiEvent.createNote(note);
        this.addEvent(notes[0]);
        this.addEvent(notes[1]);
    }

    MidiTrack.prototype.setVolume = function(volume) {
        // this.addEvent(new MidiEvent({
        //     type : 0xB, //EVT_CONTROLLER
        //     channel : this.channel,
        //     param1 : 0x7, //Main volume,
        //     param2 : volume
        // }));
        this.masterVolume = volume;
    }

    MidiTrack.prototype.setMidiInstrument = function (instrument) {
        // this.setTrackName(instrument);
        // this.setInstrument(instrument);
        this.addEvent(new MidiEvent({
            type: 0xC, //EVT_PROGRAM_CHANGE,
            channel: this.channel,
            param1: MIDI.GM.byName[instrument].number
        }));
    }

    MidiTrack.prototype.pauseFor = function (time) {
        this.addEvent(
        new MidiEvent({time: time, type: 0x8, // EVT_NOTE_OFF,
            channel: this.channel, param1:  0, param2: 0
        }));        
    }

}(window.KMUSIC = window.KMUSIC || {}, jQuery));