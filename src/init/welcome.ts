import * as vscode from 'vscode';
import * as open from 'open';
import { LanguageResourceManager } from '../i18n';
import { getConfig } from '../utils/vscode-extensions';
import { ISettingsManager, LangResourceKeys } from '../models';
import { constants } from '../constants';
import { activationCommand } from '../commands';

const i18nManager = new LanguageResourceManager(vscode.env.language);

export function manageWelcomeMessage(settingsManager: ISettingsManager): void {
  const extensionVersion = settingsManager.getSettings().extensionSettings.version;

  if (!settingsManager.getState().welcomeShown) {
    showWelcomeMessage(extensionVersion);
    return;
  }

  if (settingsManager.isNewVersion() && !getConfig().vsicons.dontShowNewVersionMessage) {
    showNewVersionMessage(extensionVersion);
  }
}

function showWelcomeMessage(extensionVersion: string): void {
  const displayMessage = () => {
    vscode.window.showInformationMessage(
      `${i18nManager.getMessage(LangResourceKeys.welcome)} v${extensionVersion}`,
      { title: i18nManager.getMessage(LangResourceKeys.activate) },
      { title: i18nManager.getMessage(LangResourceKeys.aboutOfficialApi) },
      { title: i18nManager.getMessage(LangResourceKeys.seeReadme) })
      .then(btn => {
        if (!btn) { return; }
        if (btn.title === i18nManager.getMessage(LangResourceKeys.activate)) {
          activationCommand();
          return;
        }
        if (btn.title === i18nManager.getMessage(LangResourceKeys.aboutOfficialApi)) {
          open(constants.urlOfficialApi);
          // Display the message again so the user can choose to activate or not
          displayMessage();
          return;
        }
        if (btn.title === i18nManager.getMessage(LangResourceKeys.seeReadme)) {
          open(constants.urlReadme);
          // Display the message again so the user can choose to activate or not
          displayMessage();
          return;
        }
      }, reason => {
        // tslint:disable-next-line:no-console
        console.info('Rejected because: ', reason);
        return;
      });
  };
  displayMessage();
}

function showNewVersionMessage(extensionVersion: string): void {
  vscode.window.showInformationMessage(
    `${i18nManager.getMessage(LangResourceKeys.newVersion)} v${extensionVersion}`,
    { title: i18nManager.getMessage(LangResourceKeys.seeReleaseNotes) },
    { title: i18nManager.getMessage(LangResourceKeys.dontShowThis) })
    .then(btn => {
      if (!btn) { return; }
      if (btn.title === i18nManager.getMessage(LangResourceKeys.seeReleaseNotes)) {
        open(constants.urlReleaseNote);
      } else if (btn.title === i18nManager.getMessage(LangResourceKeys.dontShowThis)) {
        getConfig().update('vsicons.dontShowNewVersionMessage', true, true);
      }
    }, reason => {
      // tslint:disable-next-line:no-console
      console.info('Rejected because: ', reason);
      return;
    });
}
