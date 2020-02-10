/* eslint-disable prefer-arrow-callback */
import { ConfigManager } from './configuration/configManager';

function uninstall(): Promise<void> {
  return ConfigManager.removeSettings();
}

uninstall();
