import * as _ from 'lodash';
import { IVSIcons, IVSCodeMessageItem } from '../models';
import * as packageJson from '../../../package.json';
import * as utils from '../utils';

export function manageAutoApplyCustomizations(
  isNewVersion: boolean,
  userConfig: IVSIcons,
  applyCustomizationCommandFn: () => void): void {
  if (!isNewVersion) { return; }
  const propObj = packageJson.contributes.configuration.properties as object;
  if (configChanged(propObj, userConfig)) {
    applyCustomizationCommandFn();
  }
}

export function manageApplyCustomizations(
  oldConfig: IVSIcons,
  newConfig: IVSIcons,
  applyCustomizationCommandFn: (additionalTitles: IVSCodeMessageItem[]) => void,
  additionalTitles?: IVSCodeMessageItem[]): void {
  if (!newConfig.dontShowConfigManuallyChangedMessage && configChanged(utils.flatten(oldConfig), newConfig)) {
    applyCustomizationCommandFn(additionalTitles);
  }
}

function configChanged(prevConfig, currentConfig) {
  for (const key of Reflect.ownKeys(prevConfig) as string[]) {
    if (!key.includes('presets') && !key.includes('associations')) {
      continue;
    }
    const oldValue = Object.prototype.toString.call(prevConfig[key]) === "[object Object]" &&
      Reflect.has(prevConfig[key], 'default')
      ? prevConfig[key].default
      : prevConfig[key];
    const parts = key.split('.').filter(x => x !== 'vsicons');
    const newValue = parts.reduce((prev, current) => prev[current], currentConfig);
    if (!_.isEqual(oldValue, newValue)) {
      return true;
    }
  }
  return false;
}
