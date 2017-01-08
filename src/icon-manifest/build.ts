import { IconGenerator } from './iconGenerator';
import { extensions as files } from './supportedExtensions';
import { extensions as folders } from './supportedFolders';
import { vscode } from '../utils';
import { schema } from './defaultSchema';
import { extensionSettings } from '../settings';

const iconGenerator = new IconGenerator(vscode, schema);
const json = iconGenerator.generateJson(files, folders);
iconGenerator.persist(extensionSettings.iconJsonFileName, json, true);
