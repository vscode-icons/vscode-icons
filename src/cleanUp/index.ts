import { readFile, writeFile, unlink } from 'fs';
import { constants } from '../constants';
import { vscodePath as getAppPath, parseJSON, pathUnixJoin } from '../utils';

export function getAppUserPath(dirPath: string): string {
  const isDev = /oss-dev/i.test(dirPath);
  const isOSS = !isDev && /oss/i.test(dirPath);
  const isInsiders = /insiders/i.test(dirPath);
  const vscodeAppName = isInsiders ? 'Code - Insiders' : isOSS ? 'Code - OSS' : isDev ? 'code-oss-dev' : 'Code';
  return pathUnixJoin(getAppPath(), vscodeAppName, 'User');
}

export function removeVSIconsSettings(settings: {}): void {
  Reflect.ownKeys(settings)
    .map(key => key.toString())
    .filter(key => /^vsicons\..+/.test(key))
    .forEach(key => delete settings[key]);
}

export function resetThemeSetting(settings: {}): void {
  if (settings[constants.vscode.iconThemeSetting] === constants.extensionName) {
    settings[constants.vscode.iconThemeSetting] = null;
  }
}

export function cleanUpVSCodeSettings(): void {
  const saveSettings = content => {
    const settings = JSON.stringify(content, null, 4);
    writeFile(settingsFilePath, settings, err => console.error(err));
  };
  const cleanUpSettings = (err, content) => {
    if (err) {
      console.error(err);
      return;
    }
    const settings = parseJSON(content);
    if (!settings) { return; }

    removeVSIconsSettings(settings);

    resetThemeSetting(settings);

    saveSettings(settings);
  };
  const settingsFilePath = pathUnixJoin(getAppUserPath(__dirname), 'settings.json');
  readFile(settingsFilePath, 'utf8', cleanUpSettings);
}

export function cleanUpVSIconsSettings(): void {
  unlink(pathUnixJoin(getAppUserPath(__dirname), 'vsicons.settings.json'),
    err => console.error(err));
}
