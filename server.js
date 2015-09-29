var express  = require('express');
var app      = express();
var port  	 = process.env.PORT || 8080;


// ------------------------------
// morgan for console log
// ------------------------------
var morgan	 = require('morgan');
app.use(morgan('dev'));


// ------------------------------
// map static paths
// public/ is available on '/'
// MIDI.js is available on 'MIDI.js'
// ------------------------------
app.use('/MIDI.js', express.static('MIDI.js'));
app.use(express.static('public'));



// ------------------------------
// Start server on port (e.g. 8080)
// ------------------------------

app.listen(port);
