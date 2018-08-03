import { existsSync, readFile, writeFile, unlink } from 'fs';
import { constants } from '../constants';
import { vscodePath as getAppPath, parseJSON, pathUnixJoin } from '../utils';
import { ErrorHandler } from '../errorHandler';

export function getAppUserPath(dirPath: string): string {
  const vscodeAppName = /[\\|/]\.vscode-oss-dev/i.test(dirPath)
    ? 'code-oss-dev'
    : /[\\|/]\.vscode-oss/i.test(dirPath)
      ? 'Code - OSS'
      : /[\\|/]\.vscode-insiders/i.test(dirPath)
        ? 'Code - Insiders'
        : /[\\|/]\.vscode/i.test(dirPath)
          ? 'Code'
          : 'user-data';
  // workaround until `process.env.VSCODE_PORTABLE` gets available
  const vscodePortable = () => {
    if (vscodeAppName !== 'user-data') {
      return undefined;
    }
    let dataDir: string;
    switch (process.platform) {
      case 'darwin':
        const isInsiders = existsSync(
          pathUnixJoin(process.env.VSCODE_CWD, 'code-insiders-portable-data'),
        );
        dataDir = `code-${isInsiders ? 'insiders-' : ''}portable-data`;
        break;
      default:
        dataDir = 'data';
        break;
    }
    return pathUnixJoin(process.env.VSCODE_CWD, dataDir);
  };
  const appPath =
    process.env.VSCODE_PORTABLE || vscodePortable() || getAppPath();
  return pathUnixJoin(appPath, vscodeAppName, 'User');
}

export function removeVSIconsSettings(settings: {}): void {
  Reflect.ownKeys(settings)
    .map(key => key.toString())
    .filter(key => /^vsicons\..+/.test(key))
    .forEach(key => delete settings[key]);
}

export function resetThemeSetting(settings: {}): void {
  if (settings[constants.vscode.iconThemeSetting] === constants.extensionName) {
    delete settings[constants.vscode.iconThemeSetting];
  }
}

export function cleanUpVSCodeSettings(): void {
  const saveSettings = content => {
    const settings = JSON.stringify(content, null, 4);
    writeFile(settingsFilePath, settings, error =>
      ErrorHandler.logError(error),
    );
  };
  const cleanUpSettings = (error, content) => {
    if (error) {
      ErrorHandler.logError(error, true);
      return;
    }
    const settings = parseJSON(content);
    if (!settings) {
      return;
    }

    removeVSIconsSettings(settings);

    resetThemeSetting(settings);

    saveSettings(settings);
  };
  const settingsFilePath = pathUnixJoin(
    getAppUserPath(__dirname),
    'settings.json',
  );
  readFile(settingsFilePath, 'utf8', cleanUpSettings);
}

export function cleanUpVSIconsSettings(): void {
  const extensionSettingsFilePath = pathUnixJoin(
    getAppUserPath(__dirname),
    constants.extensionSettingsFilename,
  );
  unlink(extensionSettingsFilePath, error => ErrorHandler.logError(error));
}
