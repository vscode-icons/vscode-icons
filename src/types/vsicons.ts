import type {
  ConfigurationTarget,
  ExtensionStatus,
  FileFormat,
  LangResourceKeys,
  Projects,
} from './enums';
import type {
  ApiIconSchema,
  IconAssociation,
  VSCodeIconPath,
  VSCodeIconSchema,
  ZedIconSchema,
} from './iconSchema';

export interface VSIcons {
  associations: Associations;
  customIconFolderPath: string;
  dontShowNewVersionMessage: boolean;
  dontShowConfigManuallyChangedMessage: boolean;
  projectDetection: ProjectDetection;
  presets: Presets;
}

export interface Associations {
  files: FileExtension[];
  folders: FolderExtension[];
  fileDefault: FileDefault;
  folderDefault: FolderDefault;
}

export interface ProjectDetection {
  autoReload: boolean;
  disableDetect: boolean;
}

export interface Presets {
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

export interface ConfigManagerContract {
  vsicons: VSIcons;
  updateVSIconsConfigState(): void;
  hasConfigChanged(
    currentConfig: VSIcons | undefined,
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

export interface ExtensionManagerContract {
  activate(): Promise<void>;
}

export interface ProjectAutoDetectionManagerContract {
  detectProjects(projectNames: Projects[]): Promise<ProjectDetectionResult[]>;
}

export interface ProjectDetectionResult {
  apply: boolean;
  project?: Projects;
  conflictingProjects?: Projects[];
  langResourceKey?: LangResourceKeys;
  value?: boolean;
}

export interface ProjectInfo {
  name?: Projects;
  version?: string;
}

export interface IconsGeneratorContract {
  generateIconsManifest(
    files?: FileCollection,
    folders?: FolderCollection,
    projectDetectionResults?: ProjectDetectionResult[],
  ): Promise<IconManifest>;
  persist(
    iconsManifest: IconManifest,
    updatePackageJson?: boolean,
  ): Promise<void>;
}

export interface FileCollection extends ExtensionCollection<FileExtension> {
  default: FileDefault;
}

export interface FileDefault {
  file?: DefaultExtension;
  file_light?: DefaultExtension;
}

export interface FolderCollection extends ExtensionCollection<FolderExtension> {
  default: FolderDefault;
}

export interface FolderDefault {
  folder?: DefaultExtension;
  folder_light?: DefaultExtension;
  root_folder?: DefaultExtension;
  root_folder_light?: DefaultExtension;
}

export interface ExtensionCollection<T> {
  supported: T[];
}

export interface IconManifest {
  api: ApiIconSchema;
  vscode: VSCodeIconSchema;
  zed: ZedIconSchema;
}

export interface BuildFiles {
  defs: Record<string, VSCodeIconPath>;
  names: {
    fileExtensions: IconAssociation;
    fileNames: IconAssociation;
  };
  light: {
    fileExtensions: IconAssociation;
    fileNames: IconAssociation;
    language: {
      fileExtensions: IconAssociation;
      fileNames: IconAssociation;
      languageIds: IconAssociation;
    };
  };
  language: {
    fileExtensions: IconAssociation;
    fileNames: IconAssociation;
    languageIds: IconAssociation;
  };
}

export interface BuildFolders {
  defs: Record<string, VSCodeIconPath>;
  names: {
    folderNames: IconAssociation;
    folderNamesExpanded: IconAssociation;
  };
  light: {
    folderNames: IconAssociation;
    folderNamesExpanded: IconAssociation;
  };
}

export interface MergedCollection {
  files: FileCollection;
  folders: FolderCollection;
}

export interface FileExtension extends Extension {
  /** @interal */
  checked?: boolean;
  /**
   * set to true if the extension represents the whole file name.
   */
  filename?: boolean;
  /**
   * collection of languages associated to the icon.
   */
  languages?: Language[];
  /**
   * array of file names to generate with file extensions to associate to the icon.
   */
  filenamesGlob?: string[];
  /**
   * array of file extensions to generate with file names to associate to the icon.
   */
  extensionsGlob?: string[];
}

export interface FolderExtension extends Extension {
  /** @internal */
  checked?: boolean;
}

export interface Extension extends DefaultExtension {
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

export interface DefaultExtension {
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
export interface Language {
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

export interface LanguageResourceManagerContract {
  localize(...keys: LangResourceLike[]): string;
  getLangResourceKey(message?: string): LangResourceKeys | undefined;
}
export interface OSSpecific {
  darwin: string;
  linux: string;
  win32: string;
}

export type LangResourceLike = string | number | LangResourceKeys;

export interface NotificationManagerContract {
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

export interface SettingsManagerContract {
  isNewVersion: boolean;
  getState: () => State;
  setState: (state: State) => Promise<void>;
  updateStatus: (status?: ExtensionStatus) => Promise<State>;
  deleteState: () => Promise<void>;
}

export interface State extends Record<string, unknown> {
  version: string;
  status: ExtensionStatus;
  welcomeShown: boolean;
}
