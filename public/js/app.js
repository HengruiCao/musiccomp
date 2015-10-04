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
	$scope.not_initialised = true;
	$scope.delay_time = 1000;

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
			$scope.not_initialised = false;
			console.log("finished");
			//console.log(MIDI.noteToKey);
			//console.log(MIDI.keyToNote);
		}
		});
	};

	$scope.init();

	$scope.refreshSeed = function(){
		$scope.seed = Math.floor(Math.random() * 10000 + 1);
	};

	$scope.refreshSeed();
	$scope.play = function () {

		MIDI.programChange(0, MIDI.GM.byName["acoustic_grand_piano"].number);
		var r = CustomRandom($scope.seed);
		var noteGen = function() { return Math.floor(r.next(50, 60));};
			
		for (var i = 0; i < 100; ++i)
		{
			var n = noteGen();
			if (n != 50)
			{
				MIDI.noteOn(0, n, 127, $scope.delay_time / 1000.0 * i);				
				MIDI.noteOn(0, noteGen(), 127, $scope.delay_time / 1000.0 * i);				
			}
			else
				console.log('pause ' + i);
		}
		MIDI.programChange(0, MIDI.GM.byName["synth_drum"].number);
		for (var i = 0; i < 100; ++i)
		{
			var n = Math.floor(r.next(0, 2));
			if (n != 0)
			{
				// MIDI.noteOn(0, 50, 127, $scope.delay_time / 1000.0 * i);				
			}
			else
				console.log('pause ' + i);
		}
	};


	$scope.playMusic = function(){
		var music = [
			'A4', 'B4', 'C5 A3', 'C4', 'E4', 'B4', 'C5', '', 'E5', '', 'B4 E3',
			'G3', 'B3', '', '', '',
			'E4', '', 'A4 D3', 'F3', 'C4', 'G4', 'A4', '', 'C5', '', 'G4'

		];
		// var off = ['', 'A4', 'B4', '', '', 'C5', 'B4', '', 'C5', '', 'E5'];
		var delay = 0;
			for (var i = 0; i < music.length; ++i)
			{
				if (music[i] != '')
				{
				var note = music[i].split(' ');
				for (var p = 0; p < note.length; ++p)
				{
					var n = MIDI.keyToNote[note[p]];
					if (n == null)
						console.log('error key' + note[p]);
					MIDI.noteOn(0, n, 127, $scope.delay_time / 1000.0 * i);
				}
			}
		}
	};
	$scope.stop = function(){
		MIDI.stopAllNotes();
		// MIDI.Player.stop();
	};
	$scope.pause = function(){
		MIDI.Player.pause();
	};
	$scope.resume = function(){
		MIDI.Player.resume();
	}
});

