import { getConfig } from '../utils/vscode-extensions';
import { ISettingsManager, IVSIcons } from '../models';

// tslint:disable-next-line no-var-requires
const packageJson = require('../../../package.json');

export function manageAutoApplyCustomizations(
  isNewVersion: boolean,
  applyCustomizationCommand: () => void): void {
  if (!isNewVersion) { return; }
  const userConfig = getConfig().vsicons;
  const defaultConfig = packageJson.contributes.configuration.properties.vsicons as IVSIcons;
  if (!areEqual(userConfig, defaultConfig)) {
    applyCustomizationCommand();
  }
}

function areEqual(user: IVSIcons, extension: IVSIcons): boolean {
  for (const key in user) {
    if (user.hasOwnProperty(key)) {
      return user[key] === extension[key];
    }
  }
  return true;
}
