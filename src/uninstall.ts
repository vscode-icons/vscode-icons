import { ConfigManager } from './configuration/configManager';

function uninstall(): Thenable<void> {
  return ConfigManager.removeSettings();
}

uninstall();
