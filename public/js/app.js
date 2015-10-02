var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		.when('/test', {templateUrl: 'templates/test.html', controller: 'musicController'})
    	.otherwise({redirectTo: '/test'});
});


app.controller('musicController', function($scope) {

	$scope.maxVolume = 127;
	$scope.minVolume = 0;
	$scope.volume = 127;
	$scope.volume_percentage = '100%';
	$scope.$watch('volume', function(newVal, oldVal){
		if (newVal != oldVal)
		{
			MIDI.setVolume(0, newVal);
	    	$scope.volume = newVal;
	    	$scope.volume_percentage = Math.floor(($scope.volume - $scope.minVolume) /
	    		($scope.maxVolume - $scope.minVolume) * 100) + '%';
		}
	});

	$scope.init = function (){
		console.log("Initialising");


		MIDI.loadPlugin({
		soundfontUrl: "res/FluidR3_GM/",
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
				MIDI.setVolume(0, $scope.volume);
				
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

	$scope.init();

	$scope.refreshSeed = function(){
		$scope.seed = Math.floor(Math.random() * 10000 + 1);
	};

	$scope.refreshSeed();
});

