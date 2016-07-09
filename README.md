# vscode-icons
[![Version](http://vsmarketplacebadge.apphb.com/version/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Installs](http://vsmarketplacebadge.apphb.com/installs/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)


Bring icons to your VS Code.

<img src="https://raw.githubusercontent.com/robertohuertasm/vscode-icons/master/screenshot.png" >

## Installation

Some people have reported that they cannot find the extension when they insert the installation command:
```
ext install vscode-icons
```

If you're in the same position try this:
```sh
ext install icons
# or
ext install "vscode-icons"
```

## Extension commands

As you know to access the command palette and introduce commands you can use ***F1*** (all OS), ***Ctrl+Shift+P*** (Windows & Linux) or ***Cmd+Shift+P*** (OS X).

- ***Icons Enable*** : It enables the extension.
- ***Icons Disable***: It will disable the icons.
- ***Icons Update***: Useful in case of extension update. It will disable and enable the icons for you refreshing the injected code and downloading new icons.

## Windows users
**In Windows, make sure you run your VS Code in Administrator mode before enabling or disabling the icons!**

## Linux users
**Linux also requires you to reclaim ownership of the vs code folders** 
You can achieve this by executing this on your terminal (Ubuntu):
```sh
#for vs code:
sudo chown -R $(whoami) /usr/share/code
#for vs code insiders:
sudo chown -R $(whoami) /usr/share/code-insiders
#if you want to check your folder's owner:
ls -la /usr/share/code
#if you want to rollback this permissions back to root:
sudo chown -R root /usr/share/code
```
If you're using any other Linux flavour please [take a look at this Github's issue](https://github.com/robertohuertasm/vscode-icons/issues/6).



## List of supported icons
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template so any help will be really appreciated and credit will be given to you ;D

## Custom icons support
If you want to use your own set of icons you can define a url in your settings and the extension will look for a package there.

The default icons url is [http://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true](http://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true).

**Very important:**: the icons' package must be named ***icons.zip*** and contain an "icons" folder => icons.zip > icons > [all the icons]

In order to set your icons.zip url you must open Preferences > User Settings and set this:

```json
{
  "vsicons.icons": "http://yourUrl/icons.zip"
}
```

If you create cool icons' sets please share your urls in the Github repo as issues and I will link them here so everyone can get access to them! ;D

##Working Files
Some of you have asked for icons for the Working Files section. As you know, this extension takes profit of the existing code by replacing it and changing a little bit its logic. There's no support from the Extension API for DOM manipulation. The Working Files section is under heavy refactoring and there are going to be changes coming soon. In fact, tabs will be implemented in this section (you can take a peek by installing the Insiders version).

In this scenario, I think it's better to wait for the next version of the Working Files section and then try to "hack" it. Possibly, once tabs are implemented the team is going to provide a proper way to extend the treeview with icons so the "hack" won't be needed at all ;P


# Disclaimer
This extension modifies some VS Code files so use it at your own risk.
Currently, icons are not supported by the extension functionality that VS Code provides so this extension solves this issue by injecting code into two files:

- workbench.main.js
- workbench.main.css

The extension will keep a copy of the original files in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update. You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

**Please, leave a review if you can so the VS Code Team can know that this is a very demanded feature and, maybe, they can then provide a proper way to extend the IDE regarding icons and customizations soon enough. ;D**

More file extensions will be supported shortly!

# Building the extension's source code
If you're willing to explore the extension source code and want to make it work you should run this first:
```js
npm run build
```
This script will generate the css and js code to be injected into vscode source code.

**Enjoy!**
