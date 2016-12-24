import { ncp } from 'ncp';
import { generate } from './iconGenerator';
const outDir = './dist';

// generating icons.json
// The function takes as second argument the directory where
// we want the file to be placed.
// Default directory is the 'root' directory
generate('icons.json', outDir);

// moving to dist
(<any> ncp).limit = 16;
ncp('./src/dev', outDir, err => {
  if (err) {
    console.error(err);
    return;
  }
  // tslint:disable no-console
  console.log('Build completed!');
});
