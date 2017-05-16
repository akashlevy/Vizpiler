// Use express library
var express = require('express');
var app = express();


// For files
var fs = require('fs');


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
  // Write parser data to file
  fs.writeFile('tmp/parser.y', req.body['parser'], function(err) {
    // Report file errors
    if (err) return console.log(err);

    // Spawn bison process and input parser data to it
    const spawn = require('child_process').spawn;
    const parser = spawn('bison', ['tmp/parser.y', '--graph=/dev/stdout', '-o', '/dev/null']);

    // Create buffers for stdout and stderr data
    stdoutdata = '';
    stderrdata = '';

    // Append stdout and stderr data to buffers
    parser.stdout.on('data', (data) => { stdoutdata += data; });
    parser.stderr.on('data', (data) => { stderrdata += data; });
    
    // On completion, return results
    parser.on('close', (code) => {
      res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
    });
  });
});


// Process AST requests
app.post('/ast', function(req, res) {
  // Write data to temp file
  fs.writeFile('tmp/parser.y', req.body['parser'], function(err) {
    // Report errors
    if (err) return console.log(err);

    // Write data to temp file
    fs.writeFile('tmp/lexer.l', req.body['lexer'], function(err) {
      // Report errors
      if (err) return console.log(err);

      // Write data to temp file
      fs.writeFile('tmp/ast.c', req.body['ast'], function(err) {
        // Report errors
        if (err) return console.log(err);

        // Run build script
        require('child_process').exec('./build_ast.sh', (err, stdout, stderr) => {
          // Report errors
          if (err) {
            res.json({'code': 1, 'stdout': '', 'stderr': err.toString()});
            return;
          }

          // On completion, return results
          res.json({'code': 0, 'stdout': stdout, 'stderr': convert.toHtml(stderr)});
        });
      });
    });
  });
});


// Process AST input requests
app.post('/astinput', function(req, res) {
  // Spawn reflex process and input lexer data to it
  const exec = require('child_process').exec;
  const astinput = exec('./tmp/ast.exe', []);
  astinput.stdin.end(req.body['astinput']);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  astinput.stdout.on('data', (data) => { stdoutdata += data; });
  astinput.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results
  astinput.on('close', (code) => {
    res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
  });
});

// Process interpreter requests
app.post('/interpreter', function(req, res) {
  // Write data to temp file
  fs.writeFile('tmp/parser.y', req.body['parser'], function(err) {
    // Report errors
    if (err) return console.log(err);

    // Write data to temp file
    fs.writeFile('tmp/lexer.l', req.body['lexer'], function(err) {
      // Report errors
      if (err) return console.log(err);

      // Write data to temp file
      fs.writeFile('tmp/interpreter.c', req.body['interpreter'], function(err) {
        // Report errors
        if (err) return console.log(err);

        // Run build script
        require('child_process').exec('./build_interp.sh', (err, stdout, stderr) => {
          // Report errors
          if (err) {
            res.json({'code': 1, 'stdout': '', 'stderr': err.toString()});
            return;
          }

          // On completion, return results
          res.json({'code': 0, 'stdout': stdout, 'stderr': convert.toHtml(stderr)});
        });
      });
    });
  });
});


// Process AST input requests
app.post('/interpreterinput', function(req, res) {
  // Spawn reflex process and input lexer data to it
  const exec = require('child_process').exec;
  const interpreterinput = exec('./tmp/interpreter.exe', []);
  interpreterinput.stdin.end(req.body['interpreterinput']);

  // Create buffers for stdout and stderr data
  stdoutdata = '';
  stderrdata = '';

  // Append stdout and stderr data to buffers
  interpreterinput.stdout.on('data', (data) => { stdoutdata += data; });
  interpreterinput.stderr.on('data', (data) => { stderrdata += data; });
  
  // On completion, return results
  interpreterinput.on('close', (code) => {
    res.json({'code': code, 'stdout': stdoutdata, 'stderr': convert.toHtml(stderrdata)});
  });
});