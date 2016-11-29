/* eslint-disable no-console*/
var vscode = require('vscode'); // eslint-disable-line
var open = require('open');
var msg = require('./messages').messages;
var settings = require('./settings');
var vars = settings.getSettings();

function showWelcomeMessage() {
  settings.setStatus(settings.status.notInstalled);
  vscode.window.showInformationMessage(msg.welcomeMessage,
    { title: msg.aboutOfficialApi }, { title: msg.seeReadme })
    .then(function (btn) {
      if (!btn) return;
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
    .then(function (btn) {
      settings.setStatus(settings.status.disabled);
      if (!btn) return;
      if (btn.title === msg.seeReleaseNotes) {
        open(msg.urlReleaseNote);
      } else if (btn.title === msg.dontshowthis) {
        vscode.workspace.getConfiguration()
          .update('vsicons.dontShowNewVersionMessage', true, true);
      }
    });
}

function runAutoInstall() {
  var state = settings.getState();
  var isNewVersion = state.version !== vars.extVersion;
  if (!state.welcomeShown) {
    // show welcome message
    showWelcomeMessage();
  } else {
    if (isNewVersion) {
      settings.setStatus(state.status);
      if (vscode.workspace.getConfiguration().vsicons.dontShowNewVersionMessage) {
        return;
      }
      showNewVersionMessage();
    }
  }
}

function activate() {
  console.log('vscode-icons is active!');
  runAutoInstall();
}
exports.activate = activate;

// this method is called when your vscode is closed
function deactivate() { }
exports.deactivate = deactivate;
