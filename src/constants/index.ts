import * as manifest from '../../../package.json';
import { IPackageManifest } from '../models/packageManifest';

export const constants = {
  environment: { production: false },
  extension: {
    name: 'vscode-icons',
    settingsFilename: 'vsicons.settings.json',
    version: (manifest as IPackageManifest).version,
    customIconFolderName: 'vsicons-custom-icons',
    distEntryFilename: 'vscode-icons.bundle.js',
    distEntryFilenameWeb: 'vscode-icons.web.bundle.js',
    uninstallEntryFilename: 'uninstall.bundle.js',
    outDirName: 'out',
    distDirName: 'dist',
    srcDirName: 'src',
    iconsDirName: 'icons',
  },
  vscode: {
    iconThemeSetting: 'workbench.iconTheme',
    reloadWindowActionSetting: 'workbench.action.reloadWindow',
    settingsFilename: 'settings.json',
  },
  vsicons: {
    name: 'vsicons',
    associations: {
      name: 'associations',
      fullname: 'vsicons.associations',
      filesSetting: 'vsicons.associations.files',
      foldersSetting: 'vsicons.associations.folders',
      defaultFileSetting: 'vsicons.associations.fileDefault.file',
    },
    dontShowConfigManuallyChangedMessageSetting:
      'vsicons.dontShowConfigManuallyChangedMessage',
    dontShowNewVersionMessageSetting: 'vsicons.dontShowNewVersionMessage',
    presets: {
      name: 'presets',
      fullname: 'vsicons.presets',
      angular: 'vsicons.presets.angular',
      nestjs: 'vsicons.presets.nestjs',
    },
    projectDetectionAutoReloadSetting: 'vsicons.projectDetection.autoReload',
    projectDetectionDisableDetectSetting:
      'vsicons.projectDetection.disableDetect',
  },
  urlReleaseNote: 'https://github.com/vscode-icons/vscode-icons/releases',
  urlReadme:
    'https://github.com/vscode-icons/vscode-icons/blob/master/README.md',
  urlOfficialApi:
    'https://code.visualstudio.com/docs/getstarted/themes#_selecting-the-file-icon-theme',
  iconsManifest: {
    filename: 'vsicons-icon-theme.json',
    iconSuffix: '',
    fileTypePrefix: 'file_type_',
    fileTypeLightPrefix: 'file_type_light_',
    folderTypePrefix: 'folder_type_',
    folderTypeLightPrefix: 'folder_type_light_',
    defaultPrefix: 'default_',
    definitionFilePrefix: '_f_',
    definitionFileLightPrefix: '_f_light_',
    definitionFolderPrefix: '_fd_',
    definitionFolderLightPrefix: '_fd_light_',
  },
};
