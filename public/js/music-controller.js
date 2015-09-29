var app = angular.module('app', []);
app.controller('musicController', function($scope) {

	$scope.init = function (){
		console.log("Initialising");


		MIDI.loadPlugin({
		soundfontUrl: "MIDI.js/examples/soundfont/",
		// instrument: "acoustic_grand_piano",
		instruments : ["acoustic_grand_piano", "synth_drum" ],

		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {

			function playSound() {
				var delay = 1; // play one note every quarter second
				var note = 50; // the MIDI note
				var velocity = 127; // how hard the note hits
				// play the note
				MIDI.setVolume(0, 127);
				
				var r = CustomRandom($scope.seed);

				var noteGen = function() { return Math.floor(r.next(50, 60));};
				var playNote = function() {
					var n = noteGen();
					MIDI.noteOn(0, n, velocity, delay);
					MIDI.noteOff(0, n, delay + 0.75);
				}

				MIDI.programChange(0, MIDI.GM.byName["acoustic_grand_piano"].number);
				playNote();
				playNote();

				MIDI.programChange(0, MIDI.GM.byName["synth_drum"].number);
				playNote();
				playNote();
			}

			$scope.play = playSound;
			console.log("finished")
		}
		});
	};



	$scope.refreshSeed = function(){
		$scope.seed = Math.floor(Math.random() * 10000 + 1);
	};

	$scope.refreshSeed();
});

