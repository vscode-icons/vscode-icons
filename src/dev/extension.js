/* eslint-disable no-console*/
var vscode = require('vscode'); // eslint-disable-line
var fs = require('fs');
var request = require('request');
var extract = require('extract-zip');
var replace = require('replace-in-file');
var replacements = require('./replacements');
var events = require('events');
var msg = require('./messages').messages;
var settings = require('./settings');

function activate(context) {
  var eventEmitter = new events.EventEmitter();
  var vars = settings.getSettings();
  var csswith = replacements.css;
  var installIcons;
  var uninstallIcons;
  var reinstallIcons;

  console.log('vscode-icons is active!');

  function showAdminPrivilegesError() {
    vscode.window.showInformationMessage(msg.admin);
    var state = settings.getState();
    if (state.status === settings.status.enabled) {
      settings.deleteState();
    }
  }

  process.on('uncaughtException', function (err) {
    if (/ENOENT|EACCES|EPERM/.test(err.code)) {
      showAdminPrivilegesError();
      return;
    }
  });

  function replaceCss() {
    replace({
      files: vars.cssfile,
      replace: vars.cssreplace,
      with: csswith + '\n\n ' + vars.cssreplace
    }, function (err) {
      console.log(err);
    });
  }

  function replaceJs(jsreplace, jswith) {
    var changed = null;
    try {
      changed = replace({
        files: vars.jsfile,
        replace: jsreplace,
        with: jswith
      });
      console.log('REPLACE SUCCESSFUL:', jsreplace.toString());
    } catch (error) {
      console.log(error);
    }
    return changed;
  }

  function replaceAllJs() {
    // eslint-disable-next-line max-len
    replaceJs('t.prototype.iconClass=function(e){return e.isDirectory?"folder-icon":"text-file-icon"}', replacements.iconClassReplace);
    replaceJs('"tab-label"', replacements.tabLabelReplace);
    replaceJs(/^\/\*!-+\n/, replacements.vsicons + '\n\n /*!----\n');
  }

  function timeDiff(d1, d2) {
    var diff = Math.abs(d2.getTime() - d1.getTime());
    return diff;
  }

  function reloadWindow() {
    // reload vscode-window
    vscode.commands.executeCommand('workbench.action.reloadWindow');
  }

  function disabledRestart() {
    settings.setStatus(settings.status.disabled);
    vscode.window.showInformationMessage(msg.disabled, { title: msg.restartIde })
      .then(function () {
        reloadWindow();
      });
  }

  function hasBeenUpdated(stats1, stats2) {
    var dbak = new Date(stats1.ctime);
    var dor = new Date(stats2.ctime);
    var segs = timeDiff(dbak, dor) / 1000;
    return segs > 20;
  }

  function cleanCssInstall() {
    var c = fs.createReadStream(vars.cssfile).pipe(fs.createWriteStream(vars.cssfilebak));
    c.on('finish', function () {
      replaceCss();
    });
  }

  function cleanJsInstall() {
    var j = fs.createReadStream(vars.jsfile).pipe(fs.createWriteStream(vars.jsfilebak));
    j.on('finish', function () {
      replaceAllJs();
    });
  }

  function installItem(bakfile, orfile, cleanInstallFunc) {
    fs.stat(bakfile, function (errBak, statsBak) {
      if (errBak) {
        // clean installation
        cleanInstallFunc();
      } else {
        // check cssfilebak's timestamp and compare it to the cssfile's.
        fs.stat(orfile, function (errOr, statsOr) {
          var updated = false;
          if (errOr) {
            vscode.window.showInformationMessage(msg.smthingwrong + errOr);
          } else {
            updated = hasBeenUpdated(statsBak, statsOr);
            if (updated) {
              // some update has occurred. clean install
              cleanInstallFunc();
            }
          }
        });
      }
    });
  }

  function extractIcons(iconPath) {
    extract(iconPath, { dir: vars.iconFolder }, function (err) {
      // extraction is complete. make sure to handle the err
      if (err) console.log(err);
      // remove icon.zip
      fs.unlink(iconPath, function (err1) {
        if (err1) {
          console.log(err1);
        }
        vscode.window.showInformationMessage(msg.enabled, { title: msg.restartIde })
          .then(function () {
            reloadWindow();
          });
      });
    });
  }

  function addIcons() {
    var zipUrl = 'https://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true';
    var config = vscode.workspace.getConfiguration('vsicons');
    var k = vars.iconFolder + (vars.isWin ? '\\icons.zip' : '/icons.zip');
    var rx = /^http.+/i;
    var r = null;

    if (config && config.icons) {
      zipUrl = config.icons;
    }

    if (rx.test(zipUrl)) {
      r = request(zipUrl).pipe(fs.createWriteStream(k));
    } else {
      r = fs.createReadStream(zipUrl).pipe(fs.createWriteStream(k));
    }

    r.on('finish', function () {
      extractIcons(k);
    });
  }

  function emitEndUninstall() {
    eventEmitter.emit('endUninstall');
  }

  function restoredAction(isRestored, willReinstall) {
    if (isRestored === 2) {
      if (willReinstall) {
        emitEndUninstall();
      } else {
        disabledRestart();
      }
    }
  }

  function restoreBak(willReinstall) {
    var restore = 0;
    var j = null;
    var c = null;

    fs.unlink(vars.jsfile, function (err) {
      if (err) {
        showAdminPrivilegesError();
        return;
      }
      j = fs.createReadStream(vars.jsfilebak).pipe(fs.createWriteStream(vars.jsfile));
      j.on('finish', function () {
        fs.unlink(vars.jsfilebak);
        restore++;
        restoredAction(restore, willReinstall);
      });
    });
    fs.unlink(vars.cssfile, function (err) {
      if (err) {
        showAdminPrivilegesError();
        return;
      }
      c = fs.createReadStream(vars.cssfilebak).pipe(fs.createWriteStream(vars.cssfile));
      c.on('finish', function () {
        fs.unlink(vars.cssfilebak);
        restore++;
        restoredAction(restore, willReinstall);
      });
    });
  }

  // ####  main commands ######################################################

  function fInstall() {
    installItem(vars.cssfilebak, vars.cssfile, cleanCssInstall);
    installItem(vars.jsfilebak, vars.jsfile, cleanJsInstall);
    addIcons();
    settings.setStatus(settings.status.enabled);
  }

  function fUninstall(willReinstall) {
    fs.stat(vars.jsfilebak, function (errBak, statsBak) {
      if (errBak) {
        if (willReinstall) {
          emitEndUninstall();
        } else {
          vscode.window.showInformationMessage(msg.already_disabled);
        }
        return;
      }
      // checking if normal file has been udpated.
      fs.stat(vars.jsfile, function (errOr, statsOr) {
        var updated = false;
        if (errOr) {
          vscode.window.showInformationMessage(msg.smthingwrong + errOr);
        } else {
          updated = hasBeenUpdated(statsBak, statsOr);
          if (updated) {
            // some update has occurred. clean install
            fs.unlink(vars.jsfilebak);
            fs.unlink(vars.cssfilebak);
            if (willReinstall) {
              emitEndUninstall();
            } else {
              disabledRestart();
            }
          } else {
            // restoring bak files
            restoreBak(willReinstall);
          }
        }
      });
    });
  }

  function fReinstall() {
    eventEmitter.once('endUninstall', fInstall);
    fUninstall(true);
  }

  installIcons = vscode.commands.registerCommand('extension.installIcons', fInstall);
  uninstallIcons = vscode.commands.registerCommand('extension.uninstallIcons', fUninstall);
  reinstallIcons = vscode.commands.registerCommand('extension.reinstallIcons', fReinstall);

  context.subscriptions.push(installIcons);
  context.subscriptions.push(uninstallIcons);
  context.subscriptions.push(reinstallIcons);

  var state = settings.getState();
  if (state.status === settings.status.notInstalled) {
    fInstall();
  } else {
    if (state.status === settings.status.enabled &&
        state.version !== vars.extVersion) {
      // auto-update
      fReinstall();
    }
  }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
