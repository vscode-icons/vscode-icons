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
    { title: msg.seeReleaseNotes })
    .then(function (btn) {
      if (btn && btn.title === msg.seeReleaseNotes) {
        open(msg.urlReleaseNote);
      }
      settings.setStatus(settings.status.disabled);
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
      // this will automatically uninstall hacks in >= 1.6.0 as installation won't work.'
      settings.setStatus(state.status);
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
