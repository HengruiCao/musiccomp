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
			instruments: ['electric_guitar_muted', 'taiko_drum','pizzicato_strings', 'overdriven_guitar', 'xylophone']
		}
	}),
	new Theme({
		name : 'taiko only',
		melody: {
			instruments: [{name: 'taiko_drum', volume: 50, speed: 30}] //an example
		},
		accomp: {
			defaultVolume: 50,
			instruments: ['taiko_drum']
		}
	})];


	//if only string present, it will be convert to {name:, volume: defaultVolume}
	//for not too verbose

} (window.KMUSIC = window.KMUSIC || {}, jQuery));