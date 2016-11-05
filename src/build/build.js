var ncp = require('ncp').ncp;
var iconGenerator = require('./iconGenerator');

// generating icons.json
iconGenerator.generate();

// moving to dist
ncp.limit = 16;
ncp('./src/dev', './dist', function (err) {
  if (err) {
    console.error(err); // eslint-disable-line
    return;
  }
  console.log('Build completed!'); // eslint-disable-line
});

