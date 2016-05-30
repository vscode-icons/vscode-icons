# vscode-icons
Icons for VS Code Explorer


## Instructions
In order to get your icons working you'll have to follow these steps:

1 - Go to your VSCode installation folder and find the path **resources\app\out\vs\workbench\workbench.main.js**. In Windows it will be something like this: *C:\Program Files (x86)\Microsoft VS Code Insiders\resources\app\out\vs\workbench*

2 - Find this piece of code:
```js
t.prototype.iconClass=function(e){return e.isDirectory?"folder-icon":"text-file-icon"}
```
and replace it with this:
```js
t.prototype.iconClass=function(s){if(s.isDirectory)return"folder-icon";var e=s.name.substring(s.name.lastIndexOf(".")+1).toLowerCase();switch(e){case"gif":case"png":case"sql":case"less":case"dockerfile":case"yml":case"ts":case"jpg":case"js":case"jsx":case"css":case"scss":case"md":case"json":case"html":case"htm":return e+"-file-icon";default:return"text-file-icon"}}
```
3 - Now find the following path: **resources\app\out\vs\workbench\workbench.main.css** and add this piece of code: 
```css
.monaco-tree-row .content .sub-content .explorer-item.folder-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/Folder_inverse.svg) 1px 4px no-repeat;
}
.monaco-tree-row .content .sub-content .explorer-item.folder-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/Folder_inverse.svg) 1px 4px no-repeat;
}
.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/Folder_opened.svg) 1px 4px no-repeat;
    background-size: 16px;
}
.explorer-item.text-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/File.svg) 1px 3px no-repeat;
    background-size: 16px;
}
.explorer-item.js-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_js@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.json-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_node@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.jsx-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_react@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.css-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_css@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.scss-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_sass@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.html-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_html@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.htm-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_html@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.jpg-file-icon,
.explorer-item.png-file-icon,
.explorer-item.gif-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_image@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.svg-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_svg@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.sql-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_sql@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.md-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_markdown@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.yml-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_yaml@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.ts-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_ts@2x.png) 1px 4px no-repeat;
    background-size: 16px;
} 
.explorer-item.dockerfile-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_docker@2x.png) 1px 4px no-repeat;
    background-size: 16px;
}
.explorer-item.less-file-icon {
    padding-left: 22px;
    background: url(./parts/files/browser/media/icons/file_type_less@2x.png) 1px 4px no-repeat;
    background-size: 16px;
}
```
4 - Finally, copy the **icons folder** into this path: **resources\app\out\vs\workbench\parts\files\browser\media\**

5 - Restart your VSCode