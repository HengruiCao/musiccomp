(function(){

var KMUSIC = window.KMUSIC = window.KMUSIC || {};

app_module.controller('main_controller', function($scope) {
    $scope.seed = 1;

    var templates = 0;
    var length = $("#includes > div").length; 
    $scope.load = function(){
    templates++;
        if(templates >= length){
            App.init();
        }
    }
    $scope.currentSong = {
    };

    $scope.themeOptions = KMUSIC.Theme.List;
    $scope.params = {};

    $scope.exportSong = function(songObj){
        var name = songObj.name;

        if (name.indexOf('.mid') === -1)
          name += '.mid';
        download(name, songObj.data);   
    }

    var generate = $scope.generate = function(seed){
        var params = $scope.params;
        params.seed = seed;
        var gen = new KMUSIC.Generation(params);
        var song = $scope.currentSong = gen.generateMusic();

        MIDI.Player.loadFile(song.data, MIDI.Player.start);
        $('.song-metadata').html(song.name);
        
    }
    resetHelper(window.App.helper);
    var regenerate = $scope.regenerate = function(){
        $scope.seed = Math.floor(Math.random() * 1000);
        generate($scope.seed);
    }

    function resetHelper(helper)
    {
        $scope.togglePlay = helper.togglePlay = function() {
            var button = $('.icon-pause');
            console.log('toggle');
            if (!button.hasClass('icon-play'))
                MIDI.Player.pause();
            else
                MIDI.Player.resume();                
            button.toggleClass('icon-play');
            //(audio && audio.paused == false) ? audio.pause() : audio.play();
        };

        $scope.changeSong = helper.changeSong = function(param) {
            if (param === 'p')
            {
                MIDI.Player.stop();
                MIDI.Player.resume();
            }
        };
    }    
});

    function main(){
        var tickPerBeat = 1;
        var seed = 42;
        var r = CustomRandom(seed);
        var seq = randomSequence(MIDI.keyToNote['C4'], 16, r);

        var tick = 0;
        MIDI.programChange(9, MIDI.GM.byName["acoustic_grand_piano"].number);

        $.each(seq.notes, function (idx, note){
            var deltaTick = note.beatLength * tickPerBeat;
            MIDI.noteOn(0, note.noteNumber, 127, tick);
            tick += deltaTick;
            MIDI.noteOff(0, note.noteNumber, tick);
            console.log(tick);
        });
    }


    MIDI.loadPlugin({
        soundfontUrl: "res/FluidR3_GM/",
        instruments : ['acoustic_grand_piano', 'synth_drum'],
        onsuccess : function(){
            console.log('finish');
            // MIDI.Player.loadFile(
            //     "song/AceAttroney/Pursuit - Cornered.mid", MIDI.Player.start);
            //MIDI.Player.loadFile(
            //     "song/DeathNote/Death Note - L's Theme.mid", MIDI.Player.start);
            // MIDI.Player.loadFile(
            //      "song/Portal - Still Alive.mid", MIDI.Player.start);
            //main();
        }
    });

})();
