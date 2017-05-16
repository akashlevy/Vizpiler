// Use express library
var express = require('express');
var app = express();


// For temporary files
var fs = require('fs');
var tempy = require('tempy');


// Use ANSI color code to HTML converter for stderr
var Convert = require('ansi-to-html');
var convert = new Convert();


// Set port appropriately
app.set('port', (process.env.PORT || 5000));


// Use public folder to serve data
app.use(express.static(__dirname + '/public'));


// Use JSON as request body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())


// Listen on port
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


// Process lexer requests
app.post('/lexer', function(req, res) {
  // Spawn reflex process and input lexer data to it
  const spawn = require('child_process').spawn;
  const lexer = spawn('reflex', ['--graphs-file=stdout', '-o', '/dev/null']);
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


// Process parser requests
app.post('/parser', function(req, res) {
  // Write parser data to temp file
  tmpfile = tempy.file({extension: 'tab.c'});
  fs.writeFile(tmpfile, req.body['parser'], function(err) { if(err) return console.log(err); });

  // Spawn bison process and input parser data to it
  const spawn = require('child_process').spawn;
  const parser = spawn('bison', [tmpfile, '--graph=/dev/stdout', '-o', '/dev/null']);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  parser.stdout.on('data', (data) => { stdoutdata += data; });
  parser.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results if error in lexing
  if (parser.stderrdata != '') {
    parser.on('close', (code) => {
      res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
    });
  }
});


// Process AST requests
app.post('/ast', function(req, res) {

  // LEXER

  // Spawn reflex process and input lexer data to it
  const spawn = require('child_process').spawn;
  const lexer = spawn('reflex', []);
  lexer.stdin.end(req.body['lexer']);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  lexer.stdout.on('data', (data) => { stdoutdata += data; });
  lexer.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results
  lexer.on('close', (code) => {
    if (code != 0) res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
  });

  // PARSER

  // Write parser data to temp file
  tmpfile = tempy.file({extension: 'tab.c'});
  fs.writeFile(tmpfile, req.body['parser'], function(err) { if(err) return console.log(err); });

  // Spawn bison process and input parser data to it
  const spawn = require('child_process').spawn;
  const parser = spawn('bison', [tmpfile]);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  parser.stdout.on('data', (data) => { stdoutdata += data; });
  parser.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results if error in lexing
  if (parser.stderrdata != '') {
    parser.on('close', (code) => {
      if (code != 0) res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
    });
  }

  // AST

  // Write parser data to temp file
  tmpfile = tempy.file({extension: 'tab.c'});
  fs.writeFile(tmpfile, req.body['parser'], function(err) { if(err) return console.log(err); });

  // Spawn bison process and input parser data to it
  const spawn = require('child_process').spawn;
  const parser = spawn('gcc', ['lex.yy.cpp', 'y.tab.c', tmpfile]);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  parser.stdout.on('data', (data) => { stdoutdata += data; });
  parser.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results if error in lexing
  if (parser.stderrdata != '') {
    parser.on('close', (code) => {
      if (code != 0) res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
    });
  }
});
