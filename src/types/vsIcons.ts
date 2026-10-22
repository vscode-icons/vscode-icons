import type {
  ConfigurationTarget,
  ExtensionStatus,
  FileFormat,
  LangResourceKeys,
  Projects,
} from './enums';
import type {
  IApiIconSchema,
  IIconAssociation,
  IVSCodeIconPath,
  IVSCodeIconSchema,
  IZedIconSchema,
} from './iconSchema';

export interface IVSIcons {
  associations: IAssociations;
  customIconFolderPath: string;
  dontShowNewVersionMessage: boolean;
  dontShowConfigManuallyChangedMessage: boolean;
  projectDetection: IProjectDetection;
  presets: IPresets;
}

export interface IAssociations {
  files: IFileExtension[];
  folders: IFolderExtension[];
  fileDefault: IFileDefault;
  folderDefault: IFolderDefault;
}

export interface IProjectDetection {
  autoReload: boolean;
  disableDetect: boolean;
}

export interface IPresets {
  angular: boolean;
  nestjs: boolean;
  jsOfficial: boolean;
  tsOfficial: boolean;
  jsonOfficial: boolean;
  hideFolders: boolean;
  foldersAllDefaultIcon: boolean;
  hideExplorerArrows: boolean;
  yamlOfficial: boolean;
}

export interface IConfigManager {
  vsicons: IVSIcons;
  updateVSIconsConfigState(): void;
  hasConfigChanged(
    currentConfig: IVSIcons | undefined,
    sections?: string[],
  ): boolean;
  getCustomIconsDirPath(path: string): Promise<string>;
  getIconTheme(): string;
  getPreset<T>(presetName: string):
    | {
        key: string;
        defaultValue?: Partial<T>;
        globalValue?: Partial<T>;
        workspaceValue?: Partial<T>;
        workspaceFolderValue?: Partial<T>;
      }
    | undefined;
  updateDontShowNewVersionMessage(value: boolean): Promise<void>;
  updateDontShowConfigManuallyChangedMessage(value: boolean): Promise<void>;
  updateAutoReload(value: boolean): Promise<void>;
  updateDisableDetection(value: boolean): Promise<void>;
  updateIconTheme(): Promise<void>;
  updatePreset(
    presetName: string,
    value: boolean,
    configurationTarget: ConfigurationTarget | boolean,
  ): Promise<void>;
}

export interface IExtensionManager {
  activate(): Promise<void>;
}

export interface IProjectAutoDetectionManager {
  detectProjects(projectNames: Projects[]): Promise<IProjectDetectionResult[]>;
}

export interface IProjectDetectionResult {
  apply: boolean;
  project?: Projects;
  conflictingProjects?: Projects[];
  langResourceKey?: LangResourceKeys;
  value?: boolean;
}

export interface IProjectInfo {
  name?: Projects;
  version?: string;
}

export interface IIconsGenerator {
  generateIconsManifest(
    files?: IFileCollection,
    folders?: IFolderCollection,
    projectDetectionResults?: IProjectDetectionResult[],
  ): Promise<IIconManifest>;
  persist(
    iconsManifest: IIconManifest,
    updatePackageJson?: boolean,
  ): Promise<void>;
}

export interface IFileCollection extends IExtensionCollection<IFileExtension> {
  default: IFileDefault;
}

export interface IFileDefault {
  file?: IDefaultExtension;
  file_light?: IDefaultExtension;
}

export interface IFolderCollection extends IExtensionCollection<IFolderExtension> {
  default: IFolderDefault;
}

export interface IFolderDefault {
  folder?: IDefaultExtension;
  folder_light?: IDefaultExtension;
  root_folder?: IDefaultExtension;
  root_folder_light?: IDefaultExtension;
}

export interface IExtensionCollection<T> {
  supported: T[];
}

export interface IIconManifest {
  api: IApiIconSchema;
  vscode: IVSCodeIconSchema;
  zed: IZedIconSchema;
}

export interface IBuildFiles {
  defs: Record<string, IVSCodeIconPath>;
  names: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
  };
  light: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
    language: {
      fileExtensions: IIconAssociation;
      fileNames: IIconAssociation;
      languageIds: IIconAssociation;
    };
  };
  language: {
    fileExtensions: IIconAssociation;
    fileNames: IIconAssociation;
    languageIds: IIconAssociation;
  };
}

export interface IBuildFolders {
  defs: Record<string, IVSCodeIconPath>;
  names: {
    folderNames: IIconAssociation;
    folderNamesExpanded: IIconAssociation;
  };
  light: {
    folderNames: IIconAssociation;
    folderNamesExpanded: IIconAssociation;
  };
}

export interface IMergedCollection {
  files: IFileCollection;
  folders: IFolderCollection;
}

export interface IFileExtension extends IExtension {
  /** @interal */
  checked?: boolean;
  /**
   * set to true if the extension represents the whole file name.
   */
  filename?: boolean;
  /**
   * collection of languages associated to the icon.
   */
  languages?: ILanguage[];
  /**
   * array of file names to generate with file extensions to associate to the icon.
   */
  filenamesGlob?: string[];
  /**
   * array of file extensions to generate with file names to associate to the icon.
   */
  extensionsGlob?: string[];
}

export interface IFolderExtension extends IExtension {
  /** @internal */
  checked?: boolean;
}

export interface IExtension extends IDefaultExtension {
  /**
   * set of extensions associated to the icon.
   */
  extensions?: string[];
  /**
   * set it to true if the extension support light icons.
   */
  light?: boolean;
  /**
   * user customization: disables the specified extension.
   */
  overrides?: string;
  /**
   * user customization: extends the specified extension.
   */
  extends?: string;
}

export interface IDefaultExtension {
  /**
   * name of the icon.
   */
  icon: string;
  /**
   * format of the icon
   */
  format?: FileFormat | string;
  /**
   * user customization: if false the extension won't be exported.
   */
  disabled?: boolean;
  /**
   * set this to true if you want to use a bundle icon.
   * This will override the `default` prefix with the one for files or folders.
   */
  useBundledIcon?: boolean;
}
export interface ILanguage {
  ids: string | string[];
  /**
   * Used by extension manifests not supporting language ids.
   * Today, only the Zed extension manifest uses this property.
   */
  knownExtensions?: string[];
  /**
   * Used by extension manifests not supporting language ids.
   * Today, only the Zed extension manifest uses this property.
   */
  knownFilenames?: string[];
}

export interface ILanguageResourceManager {
  localize(...keys: LangResourceLike[]): string;
  getLangResourceKey(message?: string): LangResourceKeys | undefined;
}
export interface IOSSpecific {
  darwin: string;
  linux: string;
  win32: string;
}

export type LangResourceLike = string | number | LangResourceKeys;

export interface INotificationManager {
  notifyInfo(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;

  notifyWarning(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;

  notifyError(
    message: LangResourceLike,
    ...items: LangResourceLike[]
  ): Promise<LangResourceLike>;
}

export interface ISettingsManager {
  isNewVersion: boolean;
  getState: () => IState;
  setState: (state: IState) => Promise<void>;
  updateStatus: (status?: ExtensionStatus) => Promise<IState>;
  deleteState: () => Promise<void>;
}

export interface IState extends Record<string, unknown> {
  version: string;
  status: ExtensionStatus;
  welcomeShown: boolean;
}
