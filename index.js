// Use express library
var express = require('express');
var app = express();

// Use ANSI color code to HTML converter for stderr
var Convert = require('ansi-to-html');
var convert = new Convert();

// Set port appropriately
app.set('port', (process.env.PORT || 5000));

// Use public folder to serve data
app.use(express.static(__dirname + '/public'));

// Use JSON as request body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json())

// Listen on port
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// Process lexer requests
app.post('/lexer', function(req, res) {
  // Spawn reflex process and input lexer data to it
  const spawn = require('child_process').spawn;
  const lexer = spawn('reflex', ['--graphs-file=stdout']);
  lexer.stdin.end(req.body['lexer']);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  lexer.stdout.on('data', (data) => { stdoutdata += data; });
  lexer.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results
  lexer.on('close', (code) => {
    res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
  });
});

