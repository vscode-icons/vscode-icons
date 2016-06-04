# vscode-icons
Bring icons to your VS Code.

## Extesion commands

- ***Icons Enable*** : It enables the extension.
- ***Icons Disable***: It will disable the icons.
- ***Icons Update***: Useful in case of extension update. It will disable and enable the icons for you refreshing the injected code and downloading new icons.

## Windows users
**In Windows, make sure you run your VS Code in Administrator mode before enabling or disabling the icons!**

## Linux users
**Linux also requires you to reclaim ownership of the vs code folders** 
You can achieve this by executing this on your terminal (Ubuntu):
```sh
#for vs code
sudo chown -R $(whoami) /usr/share/code
#for vs code insiders
sudo chown -R $(whoami) /usr/share/code-insiders
```


## List of supported icons
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template so any help will be really appreciated and credit will be given to you ;D

## Supported OS

At the moment the only supported operating systems are Windows and OS X. Linux support will come shortly.


# Disclaimer
This extension modifies some VS Code files so use it at your own risk.
Currently, icons are not supported by the extension functionality that VS Code provides so this extension solves this issue by injecting code into two files:

- workbench.main.js
- workbench.main.css

The extension will keep a copy of the original files in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update. You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

**Please, leave a review if you can so the VS Code Team can know that this is a very demanded feature. Maybe that would be enough so they can provide a proper way to extend the IDE regarding icons and customizations. ;D**

More extensions will be supported shortly!


# Screenshot
<img src="https://raw.githubusercontent.com/robertohuertasm/vscode-icons/master/screenshot.png" >

# Building the extension's source code
If you're willing to explore the extension source code and want to make it work you should run this first:
```js
npm run build
```
This script will generate the css and js code to be injected into vscode source code.

**Enjoy!**
