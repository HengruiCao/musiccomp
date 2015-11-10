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
        //controller not supported by Midi.js
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
        var inst = MIDI.GM.byName[instrument];
        if (inst === undefined)
            console.log(instrument + ' doesnt exist');
        this.addEvent(new MidiEvent({
            type: 0xC, //EVT_PROGRAM_CHANGE,
            channel: this.channel,
            param1: inst.number
        }));
    }

    MidiTrack.prototype.pauseFor = function (time) {
        this.addEvent(
        new MidiEvent({time: time * 128, type: 0x8, // EVT_NOTE_OFF,
            channel: this.channel, param1:  0, param2: 0
        }));        
    }

}(window.KMUSIC = window.KMUSIC || {}, jQuery));