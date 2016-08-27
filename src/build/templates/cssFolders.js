/* eslint-disable max-len */

module.exports =
  '.monaco-tree-row .content .sub-content .explorer-item.folder-icon {' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_inverse.svg) 1px 4px no-repeat;' +
  '}'
  +
  '.monaco-tree-row.expanded .content .sub-content .explorer-item.folder-icon { ' +
    'padding-left: 22px;' +
    'background: url(browser/parts/editor/media/icons/Folder_opened.svg) 1px 4px no-repeat;' +
    'background-size: 16px;' +
  '}' +
  '{{#supported}} ' +
    '{{#extensions}}' +
      '.monaco-tree-row .content .sub-content .explorer-item.{{parse}}-folder-icon {' +
        'padding-left: 22px;' +
        'background: url(browser/parts/editor/media/icons/folder_type_{{icon}}@2x.png) 1px 4px no-repeat;' +
        'background-size: 16px;' +
      '}' +
      '.monaco-tree-row.expanded .content .sub-content .explorer-item.{{parse}}-folder-icon {' +
        'padding-left: 22px;' +
        'background: url(browser/parts/editor/media/icons/folder_type_{{icon}}_opened@2x.png) 1px 4px no-repeat;' +
        'background-size: 16px;' +
      '}' +
    '{{/extensions}}' +
  '{{/supported}}';
