import { generate } from './iconGenerator';
const outDir = './out/src/dev';

// generating icons.json
// The function takes as second argument the directory where
// we want the file to be placed.
// Default directory is the 'root' directory
generate('icons.json', outDir);
