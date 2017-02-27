import { IVSIcons } from '../models';
import * as packageJson from '../../../package.json';

export function manageAutoApplyCustomizations(
  isNewVersion: boolean,
  userConfig: IVSIcons,
  applyCustomizationCommand: Function): void {
  if (!isNewVersion) { return; }
  const propObj = (packageJson as any).contributes.configuration.properties as Object;
  for (const key in propObj) {
    if (Reflect.has(propObj, key) && key !== 'vsicons.dontShowNewVersionMessage') {
      const defaultValue = propObj[key].default;
      const parts = key.split('.').filter(x => x !== 'vsicons');
      const userValue = parts.reduce((prev, current) => prev[current], userConfig);
      const cond1 = Array.isArray(defaultValue) && Array.isArray(userValue) && userValue.length;
      // this is to equal null == undefined as vscode doesn't respect null defaults
      // tslint:disable-next-line triple-equals
      const cond2 = !Array.isArray(defaultValue) && defaultValue != userValue;
      if (cond1 || cond2) {
        applyCustomizationCommand();
        return;
      }
    }
  }
}
