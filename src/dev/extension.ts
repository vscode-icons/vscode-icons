import * as vscode from 'vscode';
import * as open from 'open';
import { messages as msg } from './messages';
import * as settings from './settings';

const vars = settings.getSettings();

function getConfig() {
  return vscode.workspace.getConfiguration() as IExtendedWorkspaceConfiguration;
}

function showWelcomeMessage() {
  settings.setStatus(settings.status.notInstalled);
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

function showNewVersionMessage() {
  vscode.window.showInformationMessage(msg.newVersionMessage + ' v.' + vars.extVersion,
    { title: msg.seeReleaseNotes }, { title: msg.dontshowthis })
    .then(btn => {
      settings.setStatus(settings.status.disabled);
      if (!btn) { return; }
      if (btn.title === msg.seeReleaseNotes) {
        open(msg.urlReleaseNote);
      } else if (btn.title === msg.dontshowthis) {
        getConfig()
          .update('vsicons.dontShowNewVersionMessage', true, true);
      }
    });
}

function runAutoInstall() {
  const state = settings.getState();
  const isNewVersion = state.version !== vars.extVersion;

  if (!state.welcomeShown) {
    // show welcome message
    showWelcomeMessage();
    return;
  }

  if (isNewVersion) {
    settings.setStatus(state.status);
    if (!getConfig().vsicons.dontShowNewVersionMessage) {
      showNewVersionMessage();
    }
  }
}

export function activate() {
  // tslint:disable-next-line no-console
  console.log('vscode-icons is active!');
  runAutoInstall();
}

// this method is called when your vscode is closed
export function deactivate() {
  // no code here at the moment
}
