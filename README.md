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

**With the release of 4.0.0 version, support for old functionality has completely been removed for VSCode**.

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

## Enable the extension

Go to **File > Preferences > File Icon Theme > VSCode Icons**. 

(Note on OSX it is **Code > Preferences > File Icon Theme > VSCode Icons**.)


## List of supported icons
The list is slowly growing. If you want to check what icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedExtensions.js). If you feel that there's some icon missing please let me know through [the issues section of the Github's repo](https://github.com/robertohuertasm/vscode-icons/issues).

If you're a designer and you're willing to collaborate by showing your icons to the world you're more than welcome!! Currently, we don't have icons for the light template so any help will be really appreciated and credit will be given to you ;D

## List of supported folder icons
If you want to check which folder icons are currently supported take a look [here](https://github.com/robertohuertasm/vscode-icons/blob/master/src/build/supportedFolders.js). As usual, if you want to add an icon submit a PR or [raise a Github issue](https://github.com/robertohuertasm/vscode-icons/issues).

## Contributing with icons

If you're willing to create an icon just follow this few conventions:

1. We're using SVG or PNG-24 but we prefer SVG if possible.
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

### Building the extension's source code via docker
Make sure that you have docker installed.
```
docker build -t vscode-icons .
docker run --rm -it -v $PWD/dist:/app/dist vscode-icons
```
All of the files will be generated in the `dist` folder.

## Change log 
If you want to take a look at our [change log](https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md) just click [here](https://github.com/robertohuertasm/vscode-icons/blob/master/CHANGELOG.md).

If you feel that there's some icon missing please report it to the Github repository!

**Enjoy!**
