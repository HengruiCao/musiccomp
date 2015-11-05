
var major_keys = [2, 2, 1, 2, 2, 2, 1];
var minor_key = 3;

var defaultRandom = {
		next : function (min, max) {max = max || 1; min = min || 0; return Math.random() * (max - min) + min;},
		nextInt : function(min, max) {return Math.floor(this.next(min, max));}
	}; 

var getChords = function(note) {
	var major_chord = [0, 4, 7];
	var minor_chord = [0, 3, 7];
	//not implemented
}

var getKeys = function(note){
	var keys = {
		keys: [note],
		majors : [note],
		minor : note + minor_key
	};
	var maj = note;
	for (var i = 0; i < major_keys.length; ++i)
	{
		maj += major_keys[i];
		keys.majors.push(maj);
		keys.keys.push(maj);		
	}
	keys.keys.push(keys.minor);

	//circle of fifth here
	keys.nextFifth = note + 7;
	keys.prevFifth = note - 7;
	return keys;
}

var possible_beatLengths =
[
	0.25, 0.75, 0.5, 0.5, 1.0, 1.0, 2.0
]

var randomTempo = function(length, r){
	r = r || defaultRandom;//though do expect a random with next and nextInt implemented, use Math.random otherwise
	length = length || 16; //default being 16 beat in standard 4/4

	var tempo = [];
	var sum = 0;
	while (sum < length)
	{
		var bl = possible_beatLengths[r.nextInt(0, possible_beatLengths.length)];
		if (sum + bl > length)
		{
			tempo.push(length - sum);
			break ;
		}
		tempo.push(bl);
		sum += bl;
	}
	return tempo;
}

var randomKeys = function(note, length, r){
	r = r || defaultRandom;
	length = length || 16;
	note = typeof note === 'number' ? getKeys(note) : note; //do expect either midi note or keys object

	var keys = [];
	for (var i = 0; i < length; ++i)
	{
		var idx = r.nextInt(0, note.keys.length);
		keys.push(note.keys[idx]);
	}
	return keys;
}

var randomSequence = function(note, length, r){
	r = r || defaultRandom;
	length = length || 16;
	var obj = {notes : []};
	var tempo = obj.tempo = randomTempo(length, r);
	var keys = obj.keys = randomKeys(note, tempo.length, r);
	for (var i = 0; i < tempo.length; ++i)
	{
		obj.notes.push({noteNumber : keys[i], beatLength : tempo[i]});
	}
	return obj;
}