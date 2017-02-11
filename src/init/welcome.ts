import * as vscode from 'vscode';
import * as open from 'open';
import { LanguageResourceManager } from '../i18n';
import { getConfig } from '../utils/vscode-extensions';
import { IState, ISettings, ISettingsManager, ExtensionStatus, LangResourceKeys } from '../models';

const i18nManager = new LanguageResourceManager();

export function manageWelcomeMessage(settingsManager: ISettingsManager) {
  const state = settingsManager.getState();
  if (!state.welcomeShown) {
    showWelcomeMessage(settingsManager);
    return;
  }

  if (settingsManager.isNewVersion()) {
    settingsManager.setStatus(state.status);
    if (!getConfig().vsicons.dontShowNewVersionMessage) {
      showNewVersionMessage(settingsManager);
    }
  }
}

function showWelcomeMessage(settingsManager: ISettingsManager) {
  settingsManager.setStatus(ExtensionStatus.notInstalled);
  vscode.window.showInformationMessage(
    i18nManager.getMessage(vscode.env.language, LangResourceKeys.welcomeMessageBegin,
      LangResourceKeys.activationPath, LangResourceKeys.welcomeMessageEnd),
    { title: i18nManager.getMessage(vscode.env.language, LangResourceKeys.aboutOfficialApi) },
    { title: i18nManager.getMessage(vscode.env.language, LangResourceKeys.seeReadme) })
    .then(btn => {
      if (!btn) { return; }
      if (btn.title === i18nManager.getMessage(vscode.env.language, LangResourceKeys.aboutOfficialApi)) {
        open(i18nManager.getMessage(vscode.env.language, LangResourceKeys.urlOfficialApi));
      } else if (btn.title === i18nManager.getMessage(vscode.env.language, LangResourceKeys.seeReadme)) {
        open(i18nManager.getMessage(vscode.env.language, LangResourceKeys.urlReadme));
      }
    }, (reason) => {
      // tslint:disable-next-line:no-console
      console.log('Rejected because: ', reason);
      return;
    });
}

function showNewVersionMessage(settingsManager: ISettingsManager) {
  const vars = settingsManager.getSettings();
  vscode.window.showInformationMessage(
    `${i18nManager.getMessage(vscode.env.language,
      LangResourceKeys.newVersionMessage)} v.${vars.extensionSettings.version}`,
    { title: i18nManager.getMessage(vscode.env.language, LangResourceKeys.seeReleaseNotes) },
    { title: i18nManager.getMessage(vscode.env.language, LangResourceKeys.dontShowThis) })
    .then(btn => {
      settingsManager.setStatus(ExtensionStatus.disabled);
      if (!btn) { return; }
      if (btn.title === i18nManager.getMessage(vscode.env.language, LangResourceKeys.seeReleaseNotes)) {
        open(i18nManager.getMessage(vscode.env.language, LangResourceKeys.urlReleaseNote));
      } else if (btn.title === i18nManager.getMessage(vscode.env.language, LangResourceKeys.dontShowThis)) {
        getConfig().update('vsicons.dontShowNewVersionMessage', true, true);
      }
    }, (reason) => {
      // tslint:disable-next-line:no-console
      console.log('Rejected because: ', reason);
      return;
    });
}
