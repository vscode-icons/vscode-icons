var vscode = require('vscode');
var fs = require('fs');
var request = require('request');
var extract = require('extract-zip');
var path = require('path');
var replace = require('replace-in-file');
var replacements = require('./replacements');
var events = require('events');
var msg = require('./messages').messages;

function activate(context) {

    console.log('Congratulations, your extension is now active!');

    process.on('uncaughtException', function (err) {
        if (/ENOENT|EACCES|EPERM/.test(err.code)) {
            vscode.window.showInformationMessage(msg.admin);
            return;
        }
    });

    var eventEmitter = new events.EventEmitter();
    var isWin = /^win/.test(process.platform);
    var appDir = path.dirname(require.main.filename);

    var base = appDir + (isWin ? '\\vs\\workbench' : '/vs/workbench');
    var iconFolder = base + (isWin ? '\\parts\\files\\browser\\media' : '/parts/files/browser/media');


    var cssfile = base + (isWin ? '\\workbench.main.css' : '/workbench.main.css');
    var cssfilebak = base + (isWin ? '\\workbench.main.css.bak' : '/workbench.main.css.bak');

    var cssreplace = '/*! *****************************************************************************';
    var csswith = replacements.css;

    function replaceCss() {
        replace({
            files: cssfile,
            replace: cssreplace,
            with: csswith + '\n\n ' + cssreplace
        }, function (err, changedFiles) {
            console.log(err);
        });
    }

    var jsfile = base + (isWin ? '\\workbench.main.js' : '/workbench.main.js');
    var jsfilebak = base + (isWin ? '\\workbench.main.js.bak' : '/workbench.main.js.bak');

    var jsreplace = 't.prototype.iconClass=function(e){return e.isDirectory?"folder-icon":"text-file-icon"}';
    var jswith = replacements.js;

    function replaceJs() {
        replace({
            files: jsfile,
            replace: jsreplace,
            with: jswith
        }, function (err, changedFiles) {
            console.log(err);
        });
    }

    function timeDiff(d1, d2) {
        var timeDiff = Math.abs(d2.getTime() - d1.getTime());
        return timeDiff;
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
            replaceJs();
        });
    }

    function installItem(bakfile, orfile, cleanInstallFunc, replaceFunc) {
        fs.stat(bakfile, function (errBak, statsBak) {
            if (errBak) {
                // clean installation
                cleanInstallFunc();
            } else {
                // check cssfilebak's timestamp and compare it to the cssfile's.
                fs.stat(orfile, function (errOr, statsOr) {
                    if (errOr) {
                        vscode.window.showInformationMessage(msg.smthingwrong + errOr);
                    } else {
                        var updated = hasBeenUpdated(statsBak, statsOr);
                        if (updated) {
                            // some update has occurred. clean install
                            cleanInstallFunc();
                        } else {
                            replaceFunc();
                        }
                    }
                });
            }
        });
    }

    function addIcons() {
        //add icons to folder
        var zipUrl = 'http://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true';
        k = iconFolder + (isWin ? '\\icons.zip' : '/icons.zip');

        var r = request(zipUrl).pipe(fs.createWriteStream(k));
        r.on('finish', function () {
            extract(k, { dir: iconFolder }, function (err) {
                // extraction is complete. make sure to handle the err 
                if (err) console.log(err);
                vscode.window.showInformationMessage(msg.enabled);
                //remove icon.zip
                fs.unlink(k, function (err) {
                    console.log(err);
                });
            });
        });
    }

    function emitUninstall() {
        eventEmitter.emit('endUninstall');
    }

    function isRestored(restore) {
        if (restore === 2) {
            vscode.window.showInformationMessage(msg.disabled);
            emitUninstall();
        }
    }
    function restoreBak() {
        var restore = 0;
        fs.unlink(jsfile, function (err) {
            if (err) {
                vscode.window.showInformationMessage(msg.admin);
                return;
            }
            var j = fs.createReadStream(jsfilebak).pipe(fs.createWriteStream(jsfile));
            j.on('finish', function () {
                fs.unlink(jsfilebak);
                restore++;
                isRestored(restore);
            });
        });
        fs.unlink(cssfile, function (err) {
            if (err) {
                vscode.window.showInformationMessage(msg.admin);
                return;
            }
            var c = fs.createReadStream(cssfilebak).pipe(fs.createWriteStream(cssfile));
            c.on('finish', function () {
                fs.unlink(cssfilebak);
                restore++;
                isRestored(restore);
            });
        });
    }


    function fInstall() {
        installItem(cssfilebak, cssfile, cleanCssInstall, replaceCss);
        installItem(jsfilebak, jsfile, cleanJsInstall, replaceJs);
        addIcons();
    }

    function fUninstall() {
        fs.stat(jsfilebak, function (errBak, statsBak) {
            if (errBak) {
                vscode.window.showInformationMessage(msg.already_disabled);
                emitUninstall();
                return;
            }
            // checking if normal file has been udpated.
            fs.stat(jsfile, function (errOr, statsOr) {
                if (errOr) {
                    vscode.window.showInformationMessage(msg.smthingwrong + errOr);
                } else {
                    var updated = hasBeenUpdated(statsBak, statsOr);
                    if (updated) {
                        // some update has occurred. clean install
                        fs.unlink(jsfilebak);
                        fs.unlink(cssfilebak);
                        vscode.window.showInformationMessage(msg.disabled);
                        emitUninstall();
                    } else {
                        // restoring bak files
                        restoreBak();
                    }
                }
            });
        });
    }

    function fReinstall() {
        eventEmitter.once('endUninstall', fInstall);
        fUninstall();
    }

    var installIcons = vscode.commands.registerCommand('extension.installIcons', fInstall);
    var uninstallIcons = vscode.commands.registerCommand('extension.uninstallIcons', fUninstall);
    var reinstallIcons = vscode.commands.registerCommand('extension.reinstallIcons', fReinstall);

    context.subscriptions.push(installIcons);
    context.subscriptions.push(uninstallIcons);
    context.subscriptions.push(reinstallIcons);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;