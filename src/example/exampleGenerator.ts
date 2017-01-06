import * as fs from 'fs';
import { extensions as files } from '../icon-manifest/supportedExtensions';
import { extensions as folders } from '../icon-manifest/supportedFolders';
import { deleteDirectoryRecursively } from '../utils';

const supportedFlags = ['--all', '--folders', '--files'];

const folderNames = folders.supported.reduce((init, current) => {
  const obj = init;
  if (current.extensions[0]) {
    obj[current.icon] = current.extensions[0];
  }
  return obj;
}, {});

const fileNames = files.supported.reduce((init, current) => {
  const obj = init;
  const extension = current.languages && current.languages[0]
    ? current.languages[0].defaultExtension
    : current.extensions[0];

  if (!extension) {
    return obj;
  }

  obj[current.icon] = current.filename
    ? extension
    : 'file.' + extension;

  return obj;
}, {});

/**
 * Creates a directory if it doesn't exists.
 *
 * @param {any} dirName The directory name
 */
function createDirectory(dirName) {
  deleteDirectoryRecursively(dirName);
  fs.mkdirSync(dirName);
  process.chdir(dirName);
}

/**
 * Builds the files.
 *
 * @param {any} icons The icons names to build examples of
 */
function buildFiles(icons) {
  icons.forEach(icon => {
    const fileName = fileNames[icon];

    if (!fileName) {
      console.error('Unsupported file: ' + icon);
      return;
    }

    try {
      fs.writeFileSync(fileName, null);
      // tslint:disable-next-line no-console
      console.log('Example file for \'' + icon + '\' successfully created!');
    } catch (error) {
      console.error('Something went wrong while creating the file for \'' + icon + '\' :\n', error);
    }
  });
}

/**
 * Builds the folders.
 *
 * @param {any} icons The icons names to build examples of
 */
function buildFolders(icons) {
  icons.forEach(icon => {
    const dirName = folderNames[icon];

    if (!dirName) {
      console.error('Unsupported folder: ' + icon);
      return;
    }

    try {
      fs.mkdirSync(dirName);
      // tslint:disable-next-line no-console
      console.log('Example folder for \'' + icon + '\' successfully created!');
    } catch (error) {
      console.error('Something went wrong while creating the folder for \''
        + icon + '\' :\n', error);
    }
  });
}

/**
 * Builds the examples.
 *
 * @param {any} flag The flag
 * @param {any} icons The icons names to build examples of
 */
function buildExample(flag, icons) {
  const currentDir = process.cwd();

  createDirectory('examples');

  if (flag === 'files') {
    if (!icons.length) {
      buildFiles(Object.keys(fileNames));
    } else {
      buildFiles(icons);
    }
  }

  if (flag === 'folders') {
    if (!icons.length) {
      buildFolders(Object.keys(folderNames));
    } else {
      buildFolders(icons);
    }
  }

  if (flag === 'all') {
    buildFolders(Object.keys(folderNames));
    buildFiles(Object.keys(fileNames));
  }

  process.chdir(currentDir);
}

/**
 * Asserts the arguments
 *
 * @param {any} args The arguments
 * @returns 'true' if the check fails, otherwise 'false'
 */
function assertFlags(args) {
  const supportedFlagsMsg = 'Supported flags are ' + supportedFlags.join(', ') + '.';

  if (args.length <= 2) {
    console.error('Please provide a valid flag. ' + supportedFlagsMsg);
    return true;
  }

  if (args.length > 2) {
    if (supportedFlags.indexOf(args[2]) === -1) {
      console.error(supportedFlagsMsg);
      return true;
    }
  }

  return false;
}

/**
 * Generates examples for the icons.
 *
 * @param {any} args The arguments
 * @returns
 */
export function generate(args) {
  const icons = [];

  if (assertFlags(args)) {
    return;
  }

  if (supportedFlags.slice(1).indexOf(args[2]) > -1) {
    for (let i = 3; i < args.length; i++) {
      icons.push(args[i]);
    }
  }

  buildExample(args[2].slice(2), icons);
}
