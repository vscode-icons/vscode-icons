# vscode-icons
[![Version](http://vsmarketplacebadge.apphb.com/version/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Installs](http://vsmarketplacebadge.apphb.com/installs/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/robertohuertasm.vscode-icons.svg)](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
[![Build Status](https://travis-ci.org/robertohuertasm/vscode-icons.svg?branch=master)](https://travis-ci.org/robertohuertasm/vscode-icons)
[![Known Vulnerabilities](https://snyk.io/test/github/robertohuertasm/vscode-icons/badge.svg)](https://snyk.io/test/github/robertohuertasm/vscode-icons)

Bring icons to your VS Code.

<img src="https://raw.githubusercontent.com/robertohuertasm/vscode-icons/master/images/screenshot_folders.png" >

## IMPORTANT NOTE

As you all know, VSCode finally supports File and Folder icons in an official way. Read this great article by [@chrisdias](https://twitter.com/chrisdias): ["Rebellion. Mutiny. Revolt. Uprising."](https://code.visualstudio.com/blogs/2016/09/08/icon-themes) if you want to learn the history about this plugin and how finally icons landed in VSCode.

I would like to thank the VSCode team for their support during this summer (2016) in terms of migrating this extension and preparing the new contribution point (especially [@aeschli](https://github.com/aeschli) for his good disposition).

I would also like to thank the whole community for their support: bringing in ideas, collaborating and making this path easy. And I would also like to stress the great help that [@jens1o](https://github.com/jens1o) has provided to the project. He's amazing! And he's only 14!! :D Thanks, truly!

### State of the extension

**With the release of 4.0.0 version, support for old functionality has completely been removed for VSCode**.

#### Why is this happening?

There are several motives that have led me to take this decision:

1. The main goal of this extension has been completely achieved, which was to point out the importance of having icons in VSCode.
2. VSCode 1.6.0 supports icons beyond the file explorer. [See vscode#11751](https://github.com/Microsoft/vscode/issues/11751#issuecomment-248634495) 
3. Code Injection has its drawbacks both for the VSCode team and for me. Having to keep up with the Insiders build has become a nightmare and from time to time new recurrent issues are being created in VSCode's Github project about something being broken.
4. Code injection will be eventually not allowed.
5. Support from VSCode team is great and they're willing to hear all the suggestions from the community regarding icon themes.

Still, there's one missing point: `Custom Icon associations` is still not supported. They're not convinced of the value that this would bring to VSCode, so again, it's up to all of us to make the difference. I suggest that you create a Github issue with your opinions on this matter, so that the VSCode team can have a clear vision about importance of `Custom Icon associations` to the community (us). [This is a starting point](https://github.com/Microsoft/vscode/issues/12493#issuecomment-249117649). Provide a +1 if you want the VSCode team to support this feature.

More information in [#328](https://github.com/robertohuertasm/vscode-icons/issues/328)

Finally, I also would like to ask you to raise the possible issues that you may find while using this extension into the [extension's repository](https://github.com/robertohuertasm/vscode-icons/issues), not the VSCode one ;D

**Thank you all for your kind support. Finally icons are here to stay (that was the main purpose of this extension). Now let's hope they get even better :D**

----
## New Year release
We're happy to annouce that the extension now **provides custom icons and some icon presets** like `Angular2`, `Official JS Logo` and `Official TS Logo`.

With this release you will be able to completely tune the way the icons look! Please, take a look at the corresponding section to know more about how to make this work.

----
## Main Contributors

This project has gone far beyond it's main purpose, which was to provide icons for VSCode when the platform didn't still support them, and now it tries to provide the most complete set of icons you can find. I began this journey alone but this wouldn't have been possible without the help of many of you. Some members of the community have been strongly committed to the project and now they are part of the core team of mantainers.

Please, meet the team behind this extension: 

 - [@jens1o](https://github.com/jens1o)
 - [@JimiC](https://github.com/JimiC)
 - [@robertohuertasm](https://github.com/robertohuertasm)

If you're willing to collaborate with us feel free to join our [Github repository](https://github.com/robertohuertasm/vscode-icons/). ;)

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
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/icon-manifest/supportedExtensions.ts). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template, so any help will be really appreciated and credit will be given to you ;D

## List of supported folder icons
If you want to check which folder icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/icon-manifest/supportedFolders.ts). As usual, if you want to add an icon submit a PR or [raise a Github issue](https://github.com/robertohuertasm/vscode-icons/issues).

## Customizing the extension
The extension gives you the ability to change how the icons look or even what icons are associated to each extension.

We have exposed the internal API that we are using to build the `icon manifest` so you can also use it in your `vscode settings` and generate it in runtime. This will allow you to customize all the icons, add new ones and so on.

Although you now have this power, we're encouraging everyone to raise an issue in [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues) in case you find any of your customizations valuable to the rest of the community so we can implement them out of the box.

But, how does this work?

The extension now provides some specific commands for you to use. Let's talk first about the `presets` and then we're going to talk about how you can fine tune the extension.

### Presets
You have 3 different presets at the moment:

- `vsicons.presets.angular2` (true by default)
- `vsicons.presets.jsOfficial` (false by default)
- `vsicons.presets.tsOfficial` (false by default)

These 3 different presets can be changed manually by using a `settings.json` file inside your project's `.vscode` folder or by changing `vscode user settings`. Take into account that the place where you set this presets, or for whatever matter, any configuration, will be very important. `User settings` are global so all your projects will be affected by them while `project's settings` are specific to the project and you will be able to switch presets by project. This can be interesting for the `angular2` preset.

This presets can also be automatically set by leveraging a new set of commands that can be found by pressing `F1` and then writing `icons`. You will be presented with some new commands:

- `Toggle Angular2 Preset (Project Level)`: This command will enable/disable the `Angular 2 icons`.
- `Toggle Official JS Preset (User Level)`: This command will enable/disable the `Official JS icon`.
- `Toggle Official TS Preset (User Level)`: This command will enable/disable the `Official TS icon`.

Note that some of the `preset commands` will modify your `settings` at a different level. If you choose to modify them manually then you can also choose what `setting` are you going to use.

### Fine tuning
Along with the commands we introduced before you will find two more (just press `F1` and type `icons`):

- `Apply Icons Customization`: This command will regenerate the `Icons manifest` with your customizations and restart the IDE for the changes to take effect.
- `Restore Default Icon Manifest`: This command will revert any changes you may have applied and restore the extension to its default state.

But before you can even use them you will have to go to your `settings` and make your magic. The settings will provide you 2 different `array items`:

- `vsicons.associations.files`: [IFileExtension[]](https://github.com/robertohuertasm/vscode-icons/blob/master/src/models/IExtension.ts#L18)
- `vsicons.associations.folders`: [IFolderExtension[]](https://github.com/robertohuertasm/vscode-icons/blob/master/src/models/IExtension.ts#L23)

Each item of the array represents a file or a folder icon. The functionality is the same for `files` and `folders`.

Note that will important to know what the currently [supported file extensions / icons](https://github.com/robertohuertasm/vscode-icons/blob/master/src/icon-manifest/supportedExtensions.ts) and [supported folder extensions / icons](https://github.com/robertohuertasm/vscode-icons/blob/master/src/icon-manifest/supportedFolders.ts) are.

**Some examples**
```json
// Adding new extensions to an already supported icon.
// note: the format must match the existing one. If not, it will use the extension you provide.
"vsicons.associations.files": [
  { "icon": "js", "extensions": ["myExt1", "myExt2.custom.js"], "format": "svg" }
]

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

**Custom Icons**
Unfortunately, `VSCode` doesn't support absolute paths when generating the icons css. I'm willing to raise an issue in their repo and submit a PR but in the meantime we've come up with a simple solution.

The idea is that you have to look for your `User folder`:

- Windows: `C:\Users\<your_user>\.vscode\extensions`
- Linux: `/home/<your_user>/.vscode/extensions`
- Mac: `/Users/roberto/.vscode/extensions/`

and then create a folder there named like this: `robertohuertasm.vscode-icons.custom-icons`. Then, there you can put all your custom icons but, again, they have to follow `vscode-icons` naming conventions:

- Files: `file_type_<value_of_icon_property>@2x.svg`
- Folders: `folder_type_<value_of_icon_property>@2x.svg` & `folder_type_<value_of_icon_property>_opened@2x`

Note that folders must have to icons!


## Contributing with icons

If you're willing to create an icon just follow this few conventions:

1. We're using SVG or PNG-24 but we prefer SVG if possible.
2. 32x32
3. 2px margin (but see [#195](https://github.com/robertohuertasm/vscode-icons/pull/195))
4. Center the icon, but lower it a pixel.
5. It must be transparent.

## Preview of icons

In order to help you preview how the icon you are contributing will look in the editor, we are providing you with a tool that generates dummy folders or files of the provided icon. 

The syntax follows the pattern:
```js
npm run example -- [flag] [space separated file names | space separated folder names]
```

Supported flags are `--all`, `--folders`, `--files`.

#### Syntax examples:
```js
npm run example -- --folders bower css
```

**Hint:** By omitting the use of the space separated folder names, the tool will create examples for all supported folders. 

```js
npm run example -- --files actionscript angular
```

**Hint:** By omitting the use of the space separated file names, the tool will create examples for all supported files.

```js
npm run example -- --all
```

The above syntax will create examples for all supported files and folders.

## Configuration
If you don't want to see the `new version` message every time the extension updates, then you can modify this configuration setting:
```json
{
  "vsicons.dontShowNewVersionMessage": false
}
```

## Building the extension's source code
If you're willing to explore the extension source code and want to make it work you should run this:
```js
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
You can checkout all our changes in our [change log](https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md)

If you feel that there's some icon missing please report it to the Github repository!

**Enjoy!**
