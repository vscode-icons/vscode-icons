# vscode-icons
[![Version](http://vsmarketplacebadge.apphb.com/version/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Installs](http://vsmarketplacebadge.apphb.com/installs/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)


Bring icons to your VS Code.

<img src="https://raw.githubusercontent.com/robertohuertasm/vscode-icons/master/screenshot_folders.png" >

## IMPORTANT NOTE

As you all know, VSCode finally supports File and Folder icons in an official way. Read this great article by [@chrisdias](https://twitter.com/chrisdias): ["Rebellion. Mutiny. Revolt. Uprising."](https://code.visualstudio.com/blogs/2016/09/08/icon-themes) if you want to learn the history about this plugin and how finally icons landed in VSCode.

I would like to thank the VSCode team for their support during this summer in terms of migrating this extension and prepare the new contribution point, specially [@aeschli](https://github.com/aeschli) for his good disposition.

I would also like to thank all the community for their support bringing ideas, collaborating and making this path easy and I would also like to stress the great help that [@jens1o](https://github.com/jens1o) has provided to the project. He's amazing! And he's only 14!! :D Thanks, truly!

### State of the extension

**With the release of 3.0.0 version, support for old functionality has completely been removed for VSCode with versions greater or equal to 1.6.0**. Older VSCode versions will still have access to it. I'm willing to wait for a while before completely removing the access to it just to let people progressively update their VSCode and their vscode-icons extension version.

#### Why is this happening?

There are several motives that have led me to take this decision:

1. The main goal of this extension has been completely achieved, which was to point out the importance of having icons in VSCode.
2. VSCode 1.6.0 supports icons beyond the file explorer. [See vscode#11751](https://github.com/Microsoft/vscode/issues/11751#issuecomment-248634495) 
3. Code Injection has its drawbacks both for the VSCode team and for me. Having to keep up with the Insiders build has become a nightmare and from time to time new recurrent issues are being created in VSCode's Github project about something being broken.
4. Code injection will be eventually not allowed.
5. Support from VSCode team is great and they're willing to hear all the suggestions from the community regarding icon themes.

Still, there's one missing point: `Custom Icon associations` is still not supported. They're not convinced of the value that this would bring to VSCode, so again, it's up to all of you to make the difference and tell if that's important for you. I'd suggest you to create a Github issue with your opinions on this matter so the VSCode team can have a clear vision about how important are `Custom Icon associations` to you. [This is a starting point](https://github.com/Microsoft/vscode/issues/12493#issuecomment-249117649). Provide a +1 if you want the VSCode team to support this feature.

More information in [#328](https://github.com/robertohuertasm/vscode-icons/issues/328)

Finally, I also would like to ask you to raise the possible issues that you may find while using this extension into the [extension's repository](https://github.com/robertohuertasm/vscode-icons/issues), not the VSCode one ;D

**Thank you all for your kind support. Finally icons are here to stay (that was the main purpose of this extension). Now let's hope they get even better :D**

----

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

## Wanting to use the official API and get rid of the custom functionality
You will have to disable the extension by executing the `Icons Disable` command. 

Then go to **File > Preferences > File Icon Theme > VSCode Icons**. 

(Note on OSX it is **Code > Preferences > File Icon Theme > VSCode Icons**.)

If you have never used the custom functionality then just ignore the command execution step and go directly to 
**File > Preferences > File Icon Theme > VSCode Icons**. 

(On OSX it is **Code > Preferences > File Icon Theme > VSCode Icons**)

## List of supported icons
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template so any help will be really appreciated and credit will be given to you ;D

## List of supported folder icons
If you want to check which folder icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedFolders.js). As usual, if you want to add an icon submit a PR or [raise a Github issue](https://github.com/robertohuertasm/vscode-icons/issues).

## Contributing with icons

If you're willing to create an icon just follow this few conventions:

1. We're using PNG-24 at the moment.
2. 32x32
3. 2px margin (but see [#195](https://github.com/robertohuertasm/vscode-icons/pull/195))
4. Center the icon, but lower it a pixel.
5. It must be transparent.

## Building the extension's source code
If you're willing to explore the extension source code and want to make it work you should run this:
```js
npm install -d
npm run build
```
This script will install any dependencies and generate the css/js code to be injected into vscode source code.

### Building the extension's source code via docker
Make sure that you have docker installed.
```
docker build -t vscode-icons .
docker run --rm -it -v $PWD/dist:/app/dist vscode-icons
```
All of the files will be generated in the `dist` folder.

## Change log 
If you want to take a look at our [change log](https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md) just click [here](https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md).

More file extensions will be supported shortly!

----
# Custom functionality **(only for VSCode < v1.6.0)**
All the information that follows is related to the custom functionality. If you want to use any of this please read the *disclaimer* below.

## Disclaimer
You can still use the custom functionality which will provide you icons in "open editors" section, tab icons and custom icon association in case you want to change something. In case you do, you just have to execute the command `Icons Enable` but you will have to be aware that this extension modifies some VS Code files in order to provide you with these unsupported features so use it at your own risk.
Injection will take place into two files:

- workbench.main.js
- workbench.main.css

The extension will keep a copy of the original files in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update (in case you're using the custom functionality). You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

## Extension custom commands

As you know to access the command palette and introduce commands you can use ***F1*** (all OS), ***Ctrl+Shift+P*** (Windows & Linux) or ***Cmd+Shift+P*** (OS X).

- ***Icons Enable*** : It enables the extension.
- ***Icons Disable***: It will disable the icons.
- ***Icons Update***: Useful in case of extension update. It will disable and enable the icons for you refreshing the injected code and downloading new icons.

## Windows users
**In Windows, make sure you run your VS Code in Administrator mode before enabling or disabling the custom functionalities!**

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

#https://github.com/robertohuertasm/vscode-icons/issues/6#issuecomment-231535553
#an alternative approach that wouldn't need all the previous steps:
sudo code --user-data-dir=.

```
If you're using any other Linux flavour please [take a look at this Github's issue](https://github.com/robertohuertasm/vscode-icons/issues/6).

## Custom icons support and offline icons support
If you want to use your own set of icons you can define a uri in your settings and the extension will look for a package there.

The default icons uri is [http://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true](http://github.com/robertohuertasm/vscode-icons/blob/master/icons.zip?raw=true).

**Very important:** the icons' package must be named ***icons.zip*** and contain an "icons" folder => icons.zip > icons > [all the icons]

In order to set your icons.zip uri you must open Preferences > User Settings and set this:

```json
{
  "vsicons.icons": "http://yourUrl/icons.zip"
}
```
or if you want to use a local uri then
```json
{
  "vsicons.icons": "/Users/roberto/Git/github/robertohuertasm/vscode-icons/icons.zip"
}

```

If you create cool icons' sets please share your urls in the Github repo as issues and I will link them here so everyone can get access to them! ;D

### Custom Icon Packages

- [`jedmao/grayscale`](https://github.com/jedmao/vscode-icons/blob/grayscale-icons/icons.zip?raw=true)
- [`julianpaulozzi/vscode-icons-image-lib`](https://github.com/julianpaulozzi/vscode-icons-image-lib/blob/master/icons.zip?raw=true)(based on official Visual Studio Image Library).


## Optional Settings

### Hide folder icons
If you prefer not to show the folder icon because you feel that you have enough with the default VS Code icon then you can opt to disable it by using this setting (*Preferences > User Settings*):

```json
{
  "vsicons.hideFolders": true
}
```

### Hide custom folder icons
If you prefer not to show custom folder icons section you can disable them by using this setting (*Preferences > User Settings*):

```json
{
  "vsicons.hideCustomFolderIcons": true
}
```

Note that this will not hide folder icons but only customized ones like `.git`, `.meteor`, `node_modules`...

If you just want to get rid of some specific icons then I'd suggest to use file associations (see below).

```json
// in order to hide the 'src' folder custom icon:
{
 "vsicons": {
      "useFileAssociations": true,
      "associations":[
          ["^src$", ""]
      ]
  }
}
```

### Hide icons in tabs
If you prefer not to show icons in tabs you can disable them by using this setting (*Preferences > User Settings*):

```json
{
  "vsicons.hideIconsInTabs": true
}
```

### Hide icons in 'open editors' section
If you prefer not to show icons in 'open editors' section you can disable them by using this setting (*Preferences > User Settings*):

```json
{
  "vsicons.hideIconsEditors": true
}
```

### Use custom icon associations to change icons
You know you can [associate certain extensions to a specific language](https://code.visualstudio.com/docs/languages/overview#_adding-a-file-extension-to-a-language). Now you can also leverage this feature in order to map some extensions to a different icon. 

Let's say you want to map all your .js files to the html icon. Then you will have to create the file association in your settings file and then enable the extension flag.

All kind of **regular expressions** are allowed.

Note that the associations must be mapped to a supported extension. You can take a look at the list [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js). All items containted in *"extensions"* array are supported.

For instance, if you wanted to map *asp* extension to *c++* icon you should do something like this:

```json
{
 "vsicons": {
      "useFileAssociations": true,
      "associations":[
          ["\\.asp$", "cxx"]
      ]
  }
}
```

We're using an associative array instead of an object so we can respect the order of the different associations. This way you can create your own rules. **First expression to be matched will win**.

Note that this would also work:

```json
{
 "vsicons": {
      "useFileAssociations": true,
      "associations": [
          ["\\.asp$", "cpp"]
      ]
  }
}
```

That's mainly because *.cpp*, *.cxx* and some others are mapped to *c++* icon by default (See [extensions.js](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js#L17)).

```
{ icon: 'c++', extensions: ['cpp', 'hpp', 'cc', 'cxx'] }
```

**NOTE**: Please, take into account that the first element of the array is a valid Regular Expression and the second one is a **valid extension not the icon name** ;D.

**IMPORTANT**: After changing file associations you have to execute the ***"Icons Update"*** command or restart your VSCode.

## FAQs

**I want to use the official API but I'm still seeing the custom API icons**

You will have to disable the extension by executing the `Icons Disable` command. Then go to **File > Preferences > File Icon Theme > VSCode Icons**.

**I have uninstalled the extension but icons are still there**

*(This is only valid if you are using the custom funcionality)*
Due to the fact that we're injecting code into VSCode core files and there's no way to detect when you're uninstalling the extension you will have to execute the `Icons Disable` command before uninstalling. 
In case you have already uninstalled you must install the extension again, run the `Icons Disable` command and uninstall again.

**Tabs have disappeared.**

Make sure you're running VSCode >= 1.4.0. See [issue #101](https://github.com/robertohuertasm/vscode-icons/issues/101)

**I've updated to the latest version of the extension but I can't see any icon.**

Probably there's been a change in icons folder location due to new VSCode folder structure. Try executing the ***Icons Update*** command.

**I've installed the extension but I can't see no icons.**

Remember that you have to activate the extension by executing the ***Icons Enable*** command.

**I've updated my VSCode and now I can't see any icon.**

As this extension will inject code into the core files of VSCode every time that VSCode gets update those changes are lost so you will have to execute ***Icons Update*** command.

If this doesn't work then maybe you're behind a proxy. In this case, see [issue #21](https://github.com/robertohuertasm/vscode-icons/issues/21).

**I've tried everything but nothing seems to be working.**

Reinstall your VSCode and start afresh. It should work 99% of the times. If not, and you're a linux user check [issue #146](https://github.com/robertohuertasm/vscode-icons/issues/146).

If still now working, then raise an issue into [the Github repository](https://github.com/robertohuertasm/vscode-icons/issues) but first, take a look at the [closed issues](https://github.com/robertohuertasm/vscode-icons/issues?q=is%3Aissue+is%3Aclosed) as you may find [there](https://github.com/robertohuertasm/vscode-icons/issues?q=is%3Aissue+is%3Aclosed) the answer to your problems. ;D

**Why are you always updating so frequently?**

This has already been discussed in the project's Github as you can see here [#110](https://github.com/robertohuertasm/vscode-icons/issues/110) but as this seems to be a recurring subject I've decided to post it here so the thread remains open to discussion.

In general, I prefer to deliver as soon as possible by providing users with all the new stuff as soon as we get it. Often times is just a patch that must be released because something was missing or not working ok due to changes in VSCode (remember that VSCode insiders is released daily!). I'm well aware that some of you are not confortable with that, but the option to update is finally yours. You have the choice to press the update button in your VSCode or just keep it waiting until you decide is fine for you to update the extension. 


**Enjoy!**
