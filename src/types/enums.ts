export enum CommandNames {
  activateIcons,
  regenerateIcons,
  restoreIcons,
  resetProjectDetectionDefaults,
  ngPreset,
  nestPreset,
  jsPreset,
  tsPreset,
  jsonPreset,
  hideFoldersPreset,
  foldersAllDefaultIconPreset,
  hideExplorerArrowsPreset,
  yamlPreset,
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}

export enum ExtensionStatus {
  activated,
  disabled,
  deactivated,
}

export enum FileFormat {
  svg,
  png,
}

export enum IconNames {
  angular = 'ng',
  nestjs = 'nest',
  js = 'js',
  jsOfficial = 'js_official',
  ts = 'typescript',
  tsOfficial = 'typescript_official',
  tsConfig = 'tsconfig',
  tsConfigOfficial = 'tsconfig_official',
  tsDef = 'typescriptdef',
  tsDefOfficial = 'typescriptdef_official',
  json = 'json',
  jsonOfficial = 'json_official',
  yaml = 'yaml',
  yamlOfficial = 'yaml_official',
}

export enum LangResourceKeys {
  newVersion,
  seeReleaseNotes,
  dontShowThis,
  seeReadme,
  welcome,
  activate,
  aboutOfficialApi,
  learnMore,
  reload,
  autoReload,
  disableDetect,
  iconCustomization,
  iconRestore,
  ngPresetEnabled,
  ngPresetDisabled,
  nestPresetEnabled,
  nestPresetDisabled,
  jsPresetEnabled,
  jsPresetDisabled,
  tsPresetEnabled,
  tsPresetDisabled,
  jsonPresetEnabled,
  jsonPresetDisabled,
  yamlPresetEnabled,
  yamlPresetDisabled,
  hideFoldersPresetEnabled,
  hideFoldersPresetDisabled,
  foldersAllDefaultIconPresetEnabled,
  foldersAllDefaultIconPresetDisabled,
  hideExplorerArrowsPresetEnabled,
  hideExplorerArrowsPresetDisabled,
  restart,
  ngDetected,
  nonNgDetected,
  ngDetectedPresetFalse,
  nonNgDetectedPresetTrue,
  nestDetected,
  nonNestDetected,
  nestDetectedPresetFalse,
  nonNestDetectedPresetTrue,
  projectDetectionReset,
  conflictProjectsDetected,
  unsupportedVersion,
}

export enum PresetNames {
  angular,
  nestjs,
  jsOfficial,
  tsOfficial,
  jsonOfficial,
  hideFolders,
  foldersAllDefaultIcon,
  hideExplorerArrows,
  yamlOfficial,
}

export enum ProjectNames {
  ng = 'Angular',
  ngjs = 'AngularJS',
  nest = 'NestJS',
}

export enum Projects {
  angular = 'ng',
  angularjs = 'ngjs',
  nestjs = 'nest',
}
