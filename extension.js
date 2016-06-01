var vscode = require('vscode');
var fs = require('fs');
var request = require('request');
var extract = require('extract-zip');
var path = require('path');
var replace = require('replace-in-file');

function activate(context) {

    console.log('Congratulations, your extension is now active!');

    var isWin = /^win/.test(process.platform);
    var appDir = path.dirname(require.main.filename);

    var base = appDir + (isWin ? '\\vs\\workbench' : '/vs/workbench');
    var iconFolder = base + (isWin ? '\\parts\\files\\browser\\media' : '/parts/files/browser/media');


    var cssfile = base + (isWin ? '\\workbench.main.css' : '/workbench.main.css');
    var cssfilebak = base + (isWin ? '\\workbench.main.css.bak' : '/workbench.main.css.bak');

    var cssreplace = '/*! *****************************************************************************';
    var csswith = '.monaco-tree-row .content .sub-content .explorer-item.folder-icon{padding-left:22px;background:url(parts/files/browser/media/icons/Folder_inverse.svg) 1px 4px no-repeat}.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon{padding-left:22px;background:url(parts/files/browser/media/icons/Folder_opened.svg) 1px 4px no-repeat;background-size:16px}.explorer-item.text-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/File.svg) 1px 3px no-repeat;background-size:16px}.explorer-item.js-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_js@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.json-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_node@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.jsx-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_react@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.css-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_css@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.scss-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_sass@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.htm-file-icon,.explorer-item.html-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_html@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.bmp-file-icon,.explorer-item.gif-file-icon,.explorer-item.jpeg-file-icon,.explorer-item.jpg-file-icon,.explorer-item.png-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_image@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.svg-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_svg@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.sql-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_sql@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.md-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_markdown@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.yml-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_yaml@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.ts-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_typescript@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.dockerfile-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_docker@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.gitattributes-file-icon,.explorer-item.gitignore-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_git@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.otf-file-icon,.explorer-item.ttf-file-icon,.explorer-item.woff-file-icon,.explorer-item.woff2-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_font@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.less-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_less@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.jade-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_jade@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.php-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_php@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.txt-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_txt@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.license-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_license@2x.png) 1px 4px no-repeat;background-size:16px}.explorer-item.bat-file-icon,.explorer-item.cmd-file-icon,.explorer-item.sh-file-icon{padding-left:22px;background:url(parts/files/browser/media/icons/file_type_shell@2x.png) 1px 4px no-repeat;background-size:16px} ';

    function replaceCss() {
        replace({
            files: cssfile,
            replace: cssreplace,
            with: csswith + cssreplace
        }, function (err, changedFiles) {
            console.log(err);
        });
    }

    var jsfile = base + (isWin ? '\\workbench.main.js' : '/workbench.main.js');
    var jsfilebak = base + (isWin ? '\\workbench.main.js.bak' : '/workbench.main.js.bak');

    var jsreplace = 't.prototype.iconClass=function(e){return e.isDirectory?"folder-icon":"text-file-icon"}';
    var jswith = 't.prototype.iconClass=function(s){if(s.isDirectory)return"folder-icon";var e=s.name.substring(s.name.lastIndexOf(".")+1).toLowerCase();switch(e){case"license":case"cmd":case"bat":case"sh":case"txt":case"php":case"jade":case"ttf":case"otf":case"woff2":case"woff":case"gitattributes":case"gitignore":case"svg":case"gif":case"png":case"sql":case"less":case"dockerfile":case"yml":case"ts":case"jpg":case"js":case"jsx":case"css":case"scss":case"md":case"json":case"html":case"htm":return e+"-file-icon";default:return"text-file-icon"}}';

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

    function diffDays(d1, d2) {
        var timeDiff = timeDiff(d1, d2);
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    }

    function hasBeenUpdated(stats1, stats2) {
        var dbak = new Date(stats1.ctime);
        var dor = new Date(stats2.ctime);
        var segs = timeDiff(dbak, dor) / 1000;
        return segs > 5;
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
                    if (err1) {
                        vscode.window.showInformationMessage('Something went wrong: ' + errOr);
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
                vscode.window.showInformationMessage('Icons enabled. Restart the IDE.');
                //remove icon.zip
                fs.unlink(k, function (err) {
                    console.log(err)
                })
            });
        });
    }

    function restoreBak() {
        fs.unlink(jsfile, function (err) {
            var j = fs.createReadStream(jsfilebak).pipe(fs.createWriteStream(jsfile));
            j.on('finish', function () {
                fs.unlink(jsfilebak);
            });
        });
        fs.unlink(cssfile, function (err) {
            var c = fs.createReadStream(cssfilebak).pipe(fs.createWriteStream(cssfile));
            c.on('finish', function () {
                fs.unlink(cssfilebak);
                vscode.window.showInformationMessage('Icons disabled. Restart the IDE.');
            });
        })
    }

    var installIcons = vscode.commands.registerCommand('extension.installIcons', function () {
        installItem(cssfilebak, cssfile, cleanCssInstall, replaceCss);
        installItem(jsfilebak, jsfile, cleanJsInstall, replaceJs);
        addIcons();
    });

    var uninstallIcons = vscode.commands.registerCommand('extension.uninstallIcons', function () {

        fs.stat(jsfilebak, function (errBak, statsBak) {
            if (errBak) {
                vscode.window.showInformationMessage('Icons already disabled.');
                return;
            }
            // TODO CHECK IF NORMAL FILE HAS BEEN UPDATED
            fs.stat(jsfile, function (errOr, statsOr) {
                if (errOr) {
                    vscode.window.showInformationMessage('Something went wrong: ' + errOr);
                } else {
                    var updated = hasBeenUpdated(statsBak, statsOr);
                    if (updated) {
                        // some update has occurred. clean install
                        fs.unlink(jsfilebak);
                        fs.unlink(cssfilebak);
                        vscode.window.showInformationMessage('Icons disabled. Restart the IDE.');
                    } else {
                        // restoring bak files
                        restoreBak();
                    }
                }
            });
        });



    });

    context.subscriptions.push(uninstallIcons);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;