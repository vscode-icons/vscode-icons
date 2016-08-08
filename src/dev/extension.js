/* eslint-disable no-console*/
var vscode = require('vscode'); // eslint-disable-line
var fs = require('fs');
var request = require('request');
var extract = require('extract-zip');
var path = require('path');
var replace = require('replace-in-file');
var replacements = require('./replacements');
var events = require('events');
var msg = require('./messages').messages;

function activate(context) {
  var eventEmitter = new events.EventEmitter();
  var isWin = /^win/.test(process.platform);
  var appDir = path.dirname(require.main.filename);

  var base = appDir + (isWin ? '\\vs\\workbench' : '/vs/workbench');
  var iconFolder = base + (isWin ?
                           '\\browser\\parts\\editor\\media' :
                           '/browser/parts/editor/media');
  var cssfile = base + (isWin ?
                        '\\workbench.main.css' :
                        '/workbench.main.css');
  var cssfilebak = base + (isWin ? '\\workbench.main.css.bak' : '/workbench.main.css.bak');
  var cssreplace = '/*! *****************************************************************************'; // eslint-disable-line
  var csswith = replacements.css;

  var jsfile = base + (isWin ? '\\workbench.main.js' : '/workbench.main.js');
  var jsfilebak = base + (isWin ? '\\workbench.main.js.bak' : '/workbench.main.js.bak');

  var installIcons;
  var uninstallIcons;
  var reinstallIcons;

  console.log('vscode-icons is active!');

  process.on('uncaughtException', function (err) {
    if (/ENOENT|EACCES|EPERM/.test(err.code)) {
      vscode.window.showInformationMessage(msg.admin);
      return;
    }
  });

  function replaceCss() {
    replace({
      files: cssfile,
      replace: cssreplace,
      with: csswith + '\n\n ' + cssreplace
    }, function (err) {
      console.log(err);
    });
  }

  function replaceJs(jsreplace, jswith) {
    var changed = null;
    try {
      changed = replace({
        files: jsfile,
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
    var c = fs.createReadStream(cssfile).pipe(fs.createWriteStream(cssfilebak));
    c.on('finish', function () {
      replaceCss();
    });
  }

  function cleanJsInstall() {
    var j = fs.createReadStream(jsfile).pipe(fs.createWriteStream(jsfilebak));
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
    extract(iconPath, { dir: iconFolder }, function (err) {
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
    var k = iconFolder + (isWin ? '\\icons.zip' : '/icons.zip');
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

    fs.unlink(jsfile, function (err) {
      if (err) {
        vscode.window.showInformationMessage(msg.admin);
        return;
      }
      j = fs.createReadStream(jsfilebak).pipe(fs.createWriteStream(jsfile));
      j.on('finish', function () {
        fs.unlink(jsfilebak);
        restore++;
        restoredAction(restore, willReinstall);
      });
    });
    fs.unlink(cssfile, function (err) {
      if (err) {
        vscode.window.showInformationMessage(msg.admin);
        return;
      }
      c = fs.createReadStream(cssfilebak).pipe(fs.createWriteStream(cssfile));
      c.on('finish', function () {
        fs.unlink(cssfilebak);
        restore++;
        restoredAction(restore, willReinstall);
      });
    });
  }

  // ####  main commands ######################################################

  function fInstall() {
    installItem(cssfilebak, cssfile, cleanCssInstall);
    installItem(jsfilebak, jsfile, cleanJsInstall);
    addIcons();
  }

  function fUninstall(willReinstall) {
    fs.stat(jsfilebak, function (errBak, statsBak) {
      if (errBak) {
        if (willReinstall) {
          emitEndUninstall();
        } else {
          vscode.window.showInformationMessage(msg.already_disabled);
        }
        return;
      }
      // checking if normal file has been udpated.
      fs.stat(jsfile, function (errOr, statsOr) {
        var updated = false;
        if (errOr) {
          vscode.window.showInformationMessage(msg.smthingwrong + errOr);
        } else {
          updated = hasBeenUpdated(statsBak, statsOr);
          if (updated) {
            // some update has occurred. clean install
            fs.unlink(jsfilebak);
            fs.unlink(cssfilebak);
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
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
