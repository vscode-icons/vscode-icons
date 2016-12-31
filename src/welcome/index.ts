import * as vscode from 'vscode';
import * as open from 'open';
import { messages as msg } from '../messages';
import { getConfig } from '../utils/extensions';
import { IState } from '../models/IState';
import { ISettings } from '../models/ISettings';
import { ISettingsManager } from '../settings';

export function manageWelcomeMessage(settingsManager: ISettingsManager) {
  const state = settingsManager.getState();
  const vars = settingsManager.getSettings();
  const isNewVersion = state.version !== vars.extVersion;

  if (!state.welcomeShown) {
    // show welcome message
    showWelcomeMessage(settingsManager);
    return;
  }

  if (isNewVersion) {
    settingsManager.setStatus(state.status);
    if (!getConfig().vsicons.dontShowNewVersionMessage) {
      showNewVersionMessage(settingsManager);
    }
  }
}

function showWelcomeMessage(settingsManager: ISettingsManager) {
  settingsManager.setStatus(settingsManager.status.notInstalled);
  vscode.window.showInformationMessage(msg.welcomeMessage,
    { title: msg.aboutOfficialApi }, { title: msg.seeReadme })
    .then(btn => {
      if (!btn) { return; }
      if (btn.title === msg.aboutOfficialApi) {
        open(msg.urlOfficialApi);
      } else if (btn.title === msg.seeReadme) {
        open(msg.urlReadme);
      }
    });
}

function showNewVersionMessage(settingsManager: ISettingsManager) {
  const vars = settingsManager.getSettings();
  vscode.window.showInformationMessage(msg.newVersionMessage + ' v.' + vars.extVersion,
    { title: msg.seeReleaseNotes }, { title: msg.dontshowthis })
    .then(btn => {
      settingsManager.setStatus(settingsManager.status.disabled);
      if (!btn) { return; }
      if (btn.title === msg.seeReleaseNotes) {
        open(msg.urlReleaseNote);
      } else if (btn.title === msg.dontshowthis) {
        getConfig()
          .update('vsicons.dontShowNewVersionMessage', true, true);
      }
    });
}
