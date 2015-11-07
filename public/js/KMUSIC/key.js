(function(KMUSIC, $, undefined) {

	//////////////////////////////////////////	Keys
	var Key = KMUSIC.Key = function (params){
		params = params || {};
		this.note = params.note; // eg. "A"
		this.noteNumber = params.noteNumber; //%12 note number
	}

	var allKeyStrings = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
	var allKeys = Key.allKeys = [];
	for (var n = 0; n < allKeyStrings.length; ++n)
	{
		allKeys.push(new Key({note : allKeyStrings[n], noteNumber : n}));
	}
	Key.nKeys = allKeys.length; //well, 12 different keys

	Key.midiToKey = function(midi) {
		return Key.allKeys[midi % Key.nKeys];
	}

	Key.prototype.toString = function(){
		return this.note;
	}
	//////////////////////////////////////////	




	////////////////////////////////////////// Gamme

	var major_key_seq = [2, 2, 1, 2, 2, 2];
	var minor_key_seq = [2, 1, 2, 2, 1, 3];

	function addGammeKeys(keynote, seq)	{
		var ary = [];
		ary.push(Key.midiToKey(keynote));
		for (var n = 0; n < seq.length; ++n)
		{
			keynote += seq[n];
			ary.push(Key.midiToKey(keynote));
		}
		return ary;
		// for C Gamme (0, major_seq), produce 'C D E F G A B'
	}

	function addChords(keys) {
		//using the 0, 2, 4 ary
		var chord_indexes = [[0, 2, 4]];
		var chords = [];
		for (var n = 0; n < chord_indexes.length; ++n) {
			var chord_index = chord_indexes[0]; //e.g C -> C E G

			for (var _kidx = 0; _kidx < keys.length; ++_kidx) {
				var key = keys[_kidx];
				var chord = [];

				for (var _idx_idx = 0; _idx_idx < chord_index.length; ++_idx_idx) {

					var index = chord_index[_idx_idx];

					chord.push(keys[(_kidx + index) % keys.length]);
				}
				chords.push(chord);
			}
		}
		return chords;
	}


	var Gamme = KMUSIC.Gamme = function(key){
		this.main = key;

		//Init keys
		this.major_keys = addGammeKeys(key.noteNumber, major_key_seq);
		this.minor_keys = addGammeKeys(key.noteNumber, minor_key_seq);

		//Init chords
		this.major_chords = addChords(this.major_keys);
		this.minor_chords = addChords(this.minor_keys);

	}

	//////////////////////////////////////////	


} (window.KMUSIC = window.KMUSIC || {}, jQuery));