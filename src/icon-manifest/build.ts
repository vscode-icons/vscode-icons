import { IconGenerator } from './iconGenerator';
import { extensions as files } from './supportedExtensions';
import { extensions as folders } from './supportedFolders';
import { vscode } from '../utils';

const outDir = './out/src';

// generating icons.json
// The function takes as second argument the directory where
// we want the file to be placed.
// Default directory is the 'root' directory
const iconGenerator = new IconGenerator(vscode);
const json = iconGenerator.generateJson(files, folders, outDir);
iconGenerator.persist('icons.json', json, outDir);
