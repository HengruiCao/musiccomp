(function(KMUSIC, $, undefined) {
	var Measure = KMUSIC.Measure = function (measure){
		var _ = this;

		_.buffer = new KMUSIC.Buffer(measure && measure.buffer);
		this.events = function () {return _.buffer.buffer;}; //an alias to get buffer of notes
	}

	Measure.generator1 = function (params) {
		params = params || {};
		var durationList = params.durationList || [0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 2, 4];
		var balance = params.balance || 0.5;
		var mutateDuration = function (time, rand) {
			var dur = rand.nextElement(durationList);

			while (dur > time) {
		  		dur = dur / 2.0;
			}
			return dur;
		}
		return function (info) {
			var _ = info.measure || new Measure();
			var gamme = info.getGamme();
			var rand = info.getRand();
			var range = info.getRange();

			var note = rand.nextElement(gamme.major_keys);
			var duration = params.startDuration || rand.nextElement(durationList);

			var timeLeft = 4.0;
			while (timeLeft > 0) {
				if (rand.next(0, 1) > balance) {
					//change duration
					duration = mutateDuration(timeLeft, rand);
				} else {
					//change note
					note = rand.nextElement(gamme.keysUsed);
				}
					duration = mutateDuration(timeLeft, rand);

   			   	_.buffer.pushNotes(range.getNotes(note), duration);
			   	timeLeft -= duration;
			}
		  }
	}

	Measure.generator2 = function (params) { // Accompagnement
		params = params || {};
		var durationList = params.durationList || [0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4];
                var coreNote = params.coreNote || 36
		return function (info) {
		    var gamme = info.getGamme();
		    var _ = info.measure || new Measure();
                    var rand = info.getRand();
                    var mainNote = gamme.keysUsed[rand.nextInt(0, 6)].noteNumber +  (coreNote - coreNote % 12) 

                    var durationKind = [rand.nextElement(durationList), rand.nextElement(durationList)];
                    var timeLeft = 4.0;
                    while (timeLeft != 0) {
                      var dur = durationKind[rand.nextInt(0, 1)];

                      if (dur > timeLeft)
                        dur = timeLeft;

   		      _.buffer.pushNotes([mainNote], dur);
                      timeLeft -= dur;
                    }
		}
	}

	Measure.move = function (params) {
		params = params || {};
		var variations = params.variations || [2, -2];;
		return function (info, measure) {
			var diff = info.getRand().nextElement(variations); //to be coherent with gamme
			var new_measure = new Measure(measure);

			var events = new_measure.events();
			for (var n = 0; n < events.length; ++n) {
				events[n].noteNumber += diff;
			}
			return new_measure;
		} 
	}

        Measure.accompagnyContinuation = function (params) {
		params = params || {};
                return function (info, measure) {
                }
                
        }

	Measure.melodyContinuation = function (params) { // Generate next notes, to be called only once
		params = params || {};
		var variations = params.variations || [2, -2];;
		var durationList = params.durationList || [0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 4];
		var durationFlag = params.durationFlag || 0; // 0 Nothing special, 1 - Slow, 2- Fast
                if (durationFlag == 1)
		    var durationList = params.durationList || [1, 1, 1, 1, 2, 2, 4];
                else if (durationFlag == 2)
		    var durationList = params.durationList || [0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 1, 1, 1, 1, 2, 0.25];

                var directionList = [-1, -1, -1, -1, -1, 0, 1, 1, 1, 1, 1]
                var coreNote = params.coreNote || 60
		var mutateDuration = function (time, rand) {
			var dur = rand.nextElement(durationList);

			while (dur > time) {
		  		dur = dur / 2.0;
			}
			return dur;
		}
		return function (info, measure) {
			var new_measure = new Measure();
            var rand = info.getRand();
            var nextNote = function(octave, lastNote, gamme) {

              var direction = rand.nextElement(directionList);
              var choice = rand.nextInt(1, 6);
              var index = gamme.keysUsed.indexOf(KMUSIC.Key.midiToKey(lastNote));

              switch (choice) {
                case 1: // Rest on the same note
                  break;
                case 2: // Can get out of gamme
                  lastNote += direction;
                  break;
                case 3: /// 1 note
                  (index == -1) ? lastNote += 2 * direction : index += direction;
                  break;
                case 4: /// 2 notes
                  (index == -1) ? lastNote += 5 * direction : index += direction * 2;
                  break;
                case 5: /// 4 notes
                  (index == -1) ? lastNote += 7 * direction : index += direction * 4;
                  break;
                case 6: /// octave
                  lastNote += direction * 12;
                  break;
              }

              if (index != -1 && choice >= 3 && choice <= 5) {
                  if (index < 0)
                    octave -= 1;
                  else if (index >= 7)
                    octave += 1;
                  lastNote = gamme.keysUsed[(index + 7) % 7].noteNumber + 12 * octave
              }

              return lastNote;
            }
			var timeLeft = 4.0;
			var lastNote = measure.events()[measure.events().length - 1].noteNumber; // Recup last note
			while (timeLeft > 0) {
			    var duration = mutateDuration(timeLeft, rand);
                var lastNote = nextNote(Math.floor((lastNote - lastNote % 12) / 12), lastNote, info.getGamme());
                new_measure.buffer.pushNotes([lastNote], duration);
                if (lastNote > 18 + coreNote || lastNote < coreNote - 18)
                  lastNote = coreNote;
                timeLeft -= duration;
            }
			return new_measure;
		} 
	}

	Measure.varyNotes = function(params) {
		//this variation vary the noteValue of a given index

		params = params || {};
		var indexArray = params.indexArray || [-1];
		return function (info, measure) {
			var new_measure = new Measure(measure);
			var rand = info.getRand();

			var notes = new_measure.events()
			var len = notes.length;
			for (var n = 0; n < indexArray.length; ++n) {
				var index = indexArray[n];

				//get valid index;
				while (index < 0 || index >= len)
					index = (index + len) % len;

				var note = notes[index];

				note = rand.nextElement(info.getGamme().keysUsed);				
			}
			return new_measure;			
		}
	}

} (window.KMUSIC = window.KMUSIC || {}, jQuery));
