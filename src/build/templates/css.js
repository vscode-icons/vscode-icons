/* eslint-disable max-len */

module.exports = '.monaco-tree-row .content .sub-content .explorer-item.folder-icon {' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_inverse.svg) 1px 4px no-repeat;' +
  '}'
  +
  '.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon { ' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_opened.svg) 1px 4px no-repeat;' +
    'background-size: 16px;' +
  '}'
  +
  '.explorer-item.default-file-icon {' +
    'padding-left:22px;' +
    'adding-left:22px;background:url(browser/parts/editor/media/icons/File.svg) 1px 3px no-repeat;' +
    'background-size: 16px;' +
  '}' +
  '.explorer-item.file-icon {' +
    'padding-left:22px;' +
    'background-size: 16px !important;' +
  '}' +
  '{{#supported}} ' +
    '{{#extensions}}' +
      '.explorer-item.{{parse}}-file-icon { ' +
      'background: url(browser/parts/editor/media/icons/file_type_{{icon}}@2x.png) 1px 4px no-repeat;' +
    '}' +
   '{{/extensions}}' +
  '{{/supported}}' +
  '.explorer-item.file-icon.tab-label {' +
    'background-position:0px 2px;' +
  '}';
