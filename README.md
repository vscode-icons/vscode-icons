# vscode-icons
[![Version](http://vsmarketplacebadge.apphb.com/version/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Installs](http://vsmarketplacebadge.apphb.com/installs/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)

[![Build Status](https://travis-ci.org/vscode-icons/vscode-icons.svg?branch=master)](https://travis-ci.org/vscode-icons/vscode-icons)
[![Build Status](https://ci.appveyor.com/api/projects/status/github/vscode-icons/vscode-icons?branch=master&svg=true)](https://ci.appveyor.com/project/robertohuertasm/vscode-icons)
[![Dependencies Status](https://david-dm.org/vscode-icons/vscode-icons/status.svg)](https://david-dm.org/vscode-icons/vscode-icons)
[![DevDependencies Status](https://david-dm.org/vscode-icons/vscode-icons/dev-status.svg)](https://david-dm.org/vscode-icons/vscode-icons?type=dev)
[![codecov](https://codecov.io/gh/vscode-icons/vscode-icons/branch/master/graph/badge.svg)](https://codecov.io/gh/vscode-icons/vscode-icons)
[![Known Vulnerabilities](https://snyk.io/test/github/vscode-icons/vscode-icons/badge.svg)](https://snyk.io/test/github/vscode-icons/vscode-icons)

[![bitHound Overall Score](https://www.bithound.io/github/vscode-icons/vscode-icons/badges/score.svg)](https://www.bithound.io/github/vscode-icons/vscode-icons)
[![bitHound Dependencies](https://www.bithound.io/github/vscode-icons/vscode-icons/badges/dependencies.svg)](https://www.bithound.io/github/vscode-icons/vscode-icons/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/vscode-icons/vscode-icons/badges/devDependencies.svg)](https://www.bithound.io/github/vscode-icons/vscode-icons/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/vscode-icons/vscode-icons/badges/code.svg)](https://www.bithound.io/github/vscode-icons/vscode-icons)

[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/vscode-icons/vscode-icons.svg)](http://isitmaintained.com/project/vscode-icons/vscode-icons "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/vscode-icons/vscode-icons.svg)](http://isitmaintained.com/project/vscode-icons/vscode-icons "Percentage of issues still open")
[![Issue Stats](http://issuestats.com/github/vscode-icons/vscode-icons/badge/issue?style=flat)](http://issuestats.com/github/vscode-icons/vscode-icons)
[![Issue Stats](http://issuestats.com/github/vscode-icons/vscode-icons/badge/pr?style=flat)](http://issuestats.com/github/vscode-icons/vscode-icons)


Bring icons to your VS Code.

![demo](https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/images/screenshot.gif)

## A little bit of history about this extension
As you all know, VSCode currently supports File and Folder icons but this was not like this from the beginning. Read this great article by [@chrisdias](https://twitter.com/chrisdias): ["Rebellion. Mutiny. Revolt. Uprising."](https://code.visualstudio.com/blogs/2016/09/08/icon-themes) if you want to learn the history about this plugin and how finally icons landed in VSCode.

During the summer of 2016, I had great support from the community and the VSCode team. It's also worth mentioning the tremendous help that I received from [@aeschli](https://github.com/aeschli) (VSCode Team) and especially from [@jens1o](https://github.com/jens1o) (community member), which turned out to be a 14-year-old amazing coder!

Later on, until the present moment, [@JimiC](https://github.com/JimiC) entered the scene and I have to say that he's been a real revolution to this project. With his incredible insight, precision and determination, he's improving this extension way beyond it was initially intended.

I'm very happy to be part of this team, along with [@jens1o](https://github.com/jens1o) and [@JimiC](https://github.com/JimiC). It's really a gift to work with you guys. Most of the credits of this extension are theirs. It's also community's. And remember that if you want to be a contributor or even become a regular of our team, you are more than welcome to join! :D

## Main Contributors
This project has gone far beyond it's main purpose, which was to provide icons for VSCode when the platform didn't still support them, and now it tries to provide the most complete set of icons you can find. I began this journey alone but this wouldn't have been possible without the help of many of you. Some members of the community have been strongly committed to the project and now they are part of the core team of mantainers.

Please, meet the team behind this extension: 

 - [@jens1o](https://github.com/jens1o)
 - [@JimiC](https://github.com/JimiC)
 - [@robertohuertasm](https://github.com/robertohuertasm)

If you're willing to collaborate with us feel free to join our [Github repository](https://github.com/vscode-icons/vscode-icons/). ;)

---

## State of the extension

With **release 7.4.0**, as a result of hearing you out, we've revised how the `project detection` works. Now `Angular` icons are disabled by default. So if you want to enable them you will have to actively set the preset to true or rely on the `project detection` functionality.

[@JimiC](https://github.com/JimiC) has improved and further optimized this functionality specifically for this release. But he also has provided the extension with the ability to support multi-language! Take a look at the translation's section if you want to know more or contribute.

We still support the ability for users to customize the icons without having to inject anything into the `Visual Studio Code`'s code. 

This was a huge step to allow the users to fully customize how the icons looked like and how they could be associated to any extension at will.

`Custom Icon association` is still not supported by `VSCode API` but we thought that it was a very demanded feature and thought of a way to make it work for you. Remember that there's still an [open issue in VSCode's repo](https://github.com/Microsoft/vscode/issues/12493#issuecomment-249117649) talking about how they could provide official support for this feature. Provide a +1 if you want the VSCode team to support it out of the box. More information in [#328](https://github.com/vscode-icons/vscode-icons/issues/328).

**Thank you all for your kind support. We will continue to try to improve the extension to make it more user friendly :D**

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

## Enable the extension
Go to **File > Preferences > File Icon Theme > VSCode Icons**. 

(Note on OSX it is **Code > Preferences > File Icon Theme > VSCode Icons**.)


## List of supported icons
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/vscode-icons/vscode-icons/blob/master/src/icon-manifest/supportedExtensions.ts). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/vscode-icons/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template, so any help will be really appreciated and credit will be given to you ;D

## List of supported folder icons
If you want to check which folder icons are currently supported take a look [here](https://github.com/vscode-icons/vscode-icons/blob/master/src/icon-manifest/supportedFolders.ts). As usual, if you want to add an icon submit a PR or [raise a Github issue](https://github.com/vscode-icons/vscode-icons/issues).

## Configuration
If you don't want to see the `new version` message every time the extension updates, then you can modify this configuration setting:
```json
{
  "vsicons.dontShowNewVersionMessage": false
}
```

## Customizing the extension
The extension gives you the ability to change how the icons look or even what icons are associated to each extension.

We have exposed the internal API that we are using to build the `icon manifest` so you can also use it in your `vscode settings` and generate it at runtime. This will allow you to customize all the icons, add new ones and so on.

Although you now have this power, we're encouraging everyone to raise an issue in [the issues section of the Github's repo](https://github.com/vscode-icons/vscode-icons/issues) in case you find any of your customizations valuable to the rest of the community so we can implement them out of the box.

But, how does this work?

The extension now provides some specific commands for you to use. Let's talk first about the `presets` and then we're going to talk about how you can fine tune the extension.

### Presets
There are several different `presets`:

- `vsicons.presets.angular` (false by default)
- `vsicons.presets.jsOfficial` (false by default)
- `vsicons.presets.tsOfficial` (false by default)
- `vsicons.presets.jsonOfficial` (false by default)
- `vsicons.presets.hideFolders` (false by default)
- `vsicons.presets.foldersAllDefaultIcon` (false by default)

These `presets` can be changed manually by using a `settings.json` file inside your project's `.vscode` folder or by changing `vscode user settings`. Take into account that the place where you set these presets, or for that matter, any configuration, will be very important. `User settings` are global so all your projects will be affected by them while `workspace's settings` are specific to the project and you will be able to switch presets by project. This can be interesting for the `angular` preset, for example.

These `presets` can also be automatically set by leveraging a new set of commands that can be found by pressing `F1` and then writing down `icons`. You will be presented with some new commands:

- `Toggle Angular Preset (Workspace Level)`: This command will enable/disable the `Angular icons`.
- `Toggle Official JS Preset (User Level)`: This command will enable/disable the `Official JS icon`.
- `Toggle Official TS Preset (User Level)`: This command will enable/disable the `Official TS icon`.
- `Toggle Official JSON Preset (User Level)`: This command will enable/disable the `Official JSON icon`.
- `Toggle Folder Icons Visibility (User Level)`: This command will enable/disable the `Visibility of the folder icons`.
- `Toggle Specific Folder Icons (User Level)`: This command will enable/disable the `Specific folder icons`.

Note that some of the `preset commands` will modify your `settings` at a different level. If you choose to modify them manually then you can also choose what `setting` are you going to use.

**It's also important to say that if you choose to make a manual modification you will have to execute the `Apply Icons Customization` command *(see below)*.**

The `Angular Preset` will affect all icons beginning with `ng_` so you'd better name your custom icons accordingly if you want it to work flawlessly. ;P

### Project detection
With the introduction of the project specific icons toggling feature, we also introduced the auto project detection feature, that will automatically detect what type of project you have opened in your workspace and prompt you to toggle the icons accordingly.

You will be presented with four choices:

- `Restart`: Will apply the changes and restart your workspace.
- `Auto-Restart`: Will always automatically apply the changes and restart your workspace. You will not be prompt again.
- `Disable Detection`: Disables the auto project detection. You will not be prompt again.
- `Close`: Cancels your action.

There are two different `projectDetection` settings associated with this feature, that modify your `settings` at the `User Level`:

- `vsicons.projectDetection.autoReload` (false by default)
- `vsicons.projectDetection.disableDetect` (false by default)

### Fine tuning
Along with the commands we introduced above, you will find some more (just press `F1` and type `icons`):

- `Apply Icons Customization`: This command will regenerate the `Icons manifest` with your customizations and restart the IDE for the changes to take effect.
- `Reset Project Detection Defaults`: This command will reset the project detection settings to their default values.
- `Restore Default Icon Manifest`: This command will revert any changes you may have applied and restore the extension to its default state.

But before you can even use them you will have to go to your `settings` and make your magic. The settings will provide you 2 different `array items`:

- `vsicons.associations.files`: [IFileExtension[]](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/fileExtension.ts)
- `vsicons.associations.folders`: [IFolderExtension[]](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/folderExtension.ts)

Each item of the array represents a file or a folder icon. The functionality is the same for `files` and `folders`.

Note that it's important to know what the current [supported file extensions / icons](https://github.com/vscode-icons/vscode-icons/blob/master/src/icon-manifest/supportedExtensions.ts) and [supported folder extensions / icons](https://github.com/vscode-icons/vscode-icons/blob/master/src/icon-manifest/supportedFolders.ts) are.

Along with the previous arrays you will have 4 more settings available that will help you customize how the default icons for files and folders look like:

- `vsicons.associations.fileDefault.file`: [IDefaultExtension](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/defaultExtension.ts)
- `vsicons.associations.fileDefault.file_light`: [IDefaultExtension](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/defaultExtension.ts)
- `vsicons.associations.fileDefault.folder`: [IDefaultExtension](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/defaultExtension.ts)
- `vsicons.associations.fileDefault.folder_light`: [IDefaultExtension](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/defaultExtension.ts)

```js
// this is a very simple interface.
// your configuration will simply replace the default icon. See Custom Icons sections below.
"vsicons.associations.fileDefault.file": { "icon": "myfile", "format": "svg" },

// if you want to disable default icons for folders that will do the trick
"vsicons.associations.folderDefault.folder": { "icon": "myfile", "format": "svg", "disabled": true }
```

####  Some examples
```js
// Adding new extensions to an already supported icon.
// note: the format must match the existing one. If not, it will use the extension you provide.
"vsicons.associations.files": [
  { "icon": "js", "extensions": ["myExt1", "myExt2.custom.js"], "format": "svg" }
]

// Adding new filename extensions to an already supported icon.
// note: the format must match the existing one. If not, it will use the extension you provide.
"vsicons.associations.files": [
    { "icon": "webpack",  "extensions": ["webpack.config.test.js"], "filename": true, "format": "svg" }

// Disabling an already supported icon.
// note: this is, indeed, the functionality that presets are leveraging.
"vsicons.associations.files": [
  { "icon": "js", "extensions": [], "format": "svg", "disable": true }
]

// Adding a new extension.
// note: see instructions below on custom icons.
"vsicons.associations.files": [
  { "icon": "custom", "extensions": ["custom", "my.custom"], "format": "svg" }
]

// Changing the icon to an already supported icon.
"vsicons.associations.files": [
  { "icon": "newIcon", "extensions": [""], "format": "svg", "extends": "js" }
]

// Overriding an already supported icon.
// note: the difference between overrides and extends is that overrides will completely
// remove the older icon functionality while extends will keep older settings by 
// putting yours on top.
"vsicons.associations.files": [
  { "icon": "myJs", "extensions": ["js", "custom.js"], "format": "svg", "overrides": "js" }
]
```

#### Custom Icons
In order to place your custom icons you will have to create a specific folder. Depending on your OS the path will be:

- Windows: `C:\Users\<your_user>\AppData\Roaming\<Code Folder>\User\vsicons-custom-icons`
- Linux: `/home/<your_user>/.config/<Code Folder>/User/vsicons-custom-icons`
- Mac: `/Users/<your_user>/Library/Application Support/<Code Folder>/User/vsicons-custom-icons`

`<Code Folder>` refers to the name of the folder of VSCode depending on the version:

>- `Code` for the stable version.
>- `Code - Insiders` for the insiders version.

Once you have created the folder you can put all your custom icons there. But, again, they have to follow `vscode-icons` naming conventions:

- Files: `file_type_<value_of_icon_property>.svg`
- Folders: `folder_type_<value_of_icon_property>.svg` & `folder_type_<value_of_icon_property>_opened.svg`
- Default Files & Folders: `default_<value_of_icon_property>.svg`

**Note that folders must have two icons!!**

See [here the supported file extensions for an icon](https://github.com/vscode-icons/vscode-icons/blob/master/src/models/extensions/fileFormat.ts).

## Contributing with icons
If you're willing to create an icon just follow this few conventions:

1. We're using SVG or PNG-24 but we prefer SVG if possible.
2. 32x32
3. 2px margin (but see [#195](https://github.com/vscode-icons/vscode-icons/pull/195))
4. Center the icon, but lower it a pixel.
5. It must be transparent.

## Preview of icons
In order to help you preview how the icon you are contributing will look in the editor, we are providing you with a tool that generates dummy folders or files of the provided icon. 

The syntax follows the pattern:
```
npm run example -- [flag] [space separated file names | space separated folder names]
```

Supported flags are `--all`, `--folders`, `--files`.

#### Syntax examples:
```
npm run example -- --folders bower css
```

**Hint:** By omitting the use of the space separated folder names, the tool will create examples for all supported folders. 

```
npm run example -- --files actionscript angular
```

**Hint:** By omitting the use of the space separated file names, the tool will create examples for all supported files.

```
npm run example -- --all
```

The above syntax will create examples for all supported files and folders.

## Contributing with translations
We're looking for people willing to help us translate the extension's messages into [all the languages that `vscode` supports](https://code.visualstudio.com/docs/customization/locales).

We're currently supporting English, German and Spanish. If you're willing to help with the translations of the missing languages take a look at [#526](https://github.com/vscode-icons/vscode-icons/issues/526) and get your hands dirty. We'll really appreciate it! ;P

## Building the extension's source code
If you're willing to explore the extension source code and want to make it work you should run this:
```
npm install -d
npm run build
```

### Building the extension's source code via docker
Make sure that you have docker installed.
```
docker build -t vscode-icons .
docker run --rm -it -v $PWD/dist:/app/dist vscode-icons
```
All of the files will be generated in the `dist` folder.

## Change log 
You can checkout all our changes in our [change log](https://github.com/vscode-icons/vscode-icons/blob/master/CHANGELOG.md).

If you feel that there's some icon missing please report it to the Github repository!

## Versioning
vscode-icons follows [Semantic Versioning 2.0.0](http://semver.org/).

**Enjoy!**
