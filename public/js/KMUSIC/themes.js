(function(KMUSIC, $, undefined) {


	var InstrumentSet = KMUSIC.InstrumentSet = function(params) {
		this.defaultVolume = params.defaultVolume || 100;
		this.instruments = params.instruments ||
		['bright_acoustic_piano', 'acoustic_grand_piano',
		'viola', 'acoustic_guitar_steel']

		this.getInstrument = function (rand) {

			var elem = (rand.nextElement && rand.nextElement(this.instruments))
			 || this.instruments[rand % this.instruments.length];

			if (typeof elem === 'string') {
				return {
					name: elem,
					volume: this.defaultVolume
				};
			}
			return elem;
		}
	}

	var Theme = KMUSIC.Theme = function(params){
		this.name = params.name || 'no name';
		this.accomp = new InstrumentSet(params.accomp || {});
		this.melody = new InstrumentSet(params.melody || {});
	}


	Theme.List = [
	new Theme({
		name : 'default',
		melody: {
			instruments: ['bright_acoustic_piano', 'acoustic_grand_piano',
			'viola', 'acoustic_guitar_steel']
		},
		accomp: {
			defaultVolume: 50,
			instruments: ['electric_guitar_muted', 'taiko_drum','pizzicato_strings', 'acoustic_grand_piano', 'xylophone']
		}
	}),

	new Theme({
		name : 'folk',
		melody: {
			instruments: ['acoustic_guitar_steel', 'pizzicato_strings']

		},
		accomp: {
			defaultVolume: 20,
			instruments: [{name : 'steel_drums', volume: 40}, 'electric_guitar_muted', 'acoustic_grand_piano', {name: 'revese_cymbal', volume: 30, spead: 1}, 'synth_drum', 'fretless_bass', 'trombone', 'electric_bass_pick']
		}
	}),

	new Theme({
		name : 'pop',
		melody: {
			instruments: ['electric_guitar_clean']

		},
		accomp: {
			defaultVolume: 20,
			instruments: [{name : 'steel_drums', volume: 40}, 'electric_guitar_muted', 'acoustic_grand_piano', 'slap_bass_1', 'rock_organ', 'electric_bass_pick', 'electric_bass_finger']

		}
	}),

	new Theme({
		name : 'western',
		melody: {
			instruments: ['acoustic_guitar_steel', 'electric_guitar_clean', 'electric_grand_piano', 'lead_6_voice']
		},
		accomp: {
			defaultVolume: 30,
			instruments: [{name : 'steel_drums', volume: 100}, 'slap_bass_1', 'pad_2_warm', 'whistle','electric_bass_pick', 'electric_bass_finger', 'percussive_organ']
		}
	}),

	new Theme({
		name : 'jazz',
		melody: {
			instruments: [{name: 'contrabass', volume: 60, speed: 1}, {name: 'steel_drums', volume: 50},'bright_acoustic_piano', 'acoustic_grand_piano', 'trombone', {name:'tenor_sax', volume : 60}, 'clavinet' ] 

		},
		accomp: {
			defaultVolume: 20,
			instruments: [{name : 'steel_drums', volume: 20}, {name: 'acoustic_grand_piano', volume: 50}, 'english_horn', 'electric_guitar_jazz']

		}
	}),

	new Theme({
		name : 'taiko only',
		melody: {
			instruments: [{name: 'taiko_drum', volume: 100, speed: 0}] //an example
		},
		accomp: {
			defaultVolume: 100,
			instruments: ['taiko_drum']
		}
	})];


	//if only string present, it will be convert to {name:, volume: defaultVolume}
	//for not too verbose

} (window.KMUSIC = window.KMUSIC || {}, jQuery));
