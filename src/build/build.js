var ncp = require('ncp').ncp;
var iconGenerator = require('./iconGenerator');

var outDir = './dist';

// generating icons.json
// The function takes as second argument the directory where
// we want the file to be placed.
// Default directory is the 'root' directory
iconGenerator.generate('icons.json');

// moving to dist
ncp.limit = 16;
ncp('./src/dev', outDir, function (err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Build completed!');
});

