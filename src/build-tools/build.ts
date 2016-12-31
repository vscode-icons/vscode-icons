import { persist, generateJson } from './iconGenerator';
import { extensions as files } from './supportedExtensions';
import { extensions as folders } from './supportedFolders';

const outDir = './out/src/extension';

// generating icons.json
// The function takes as second argument the directory where
// we want the file to be placed.
// Default directory is the 'root' directory
const json = generateJson(outDir, files, folders);
persist('icons.json', outDir, json);
