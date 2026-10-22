import type * as types from '../types';
import type {
  IPackageManifest,
  IVSCodeIconTheme,
  IVSCodeManifest,
} from '../types/package';

import { coerce, gte, parse } from 'semver';

import packageJson from '../../../package.json';
import { Utils } from '../utils';

export class VSCodeManager implements types.IVSCodeManager {
  private appUserDirPath: string;
  private supportsThemeReloadVersion = '1.34.0';

  constructor(
    private vscode: types.IVSCode,
    private extensionContext: types.IVSCodeExtensionContext,
  ) {
    if (!vscode) {
      throw new ReferenceError(`'vscode' not set to an instance`);
    }
    if (!extensionContext) {
      throw new ReferenceError(`'extensionContext' not set to an instance`);
    }
  }

  public get context(): types.IVSCodeExtensionContext {
    return this.extensionContext;
  }

  public get env(): types.IVSCodeEnv {
    return this.vscode.env;
  }

  public get commands(): types.IVSCodeCommands {
    return this.vscode.commands;
  }

  public get version(): string {
    return this.vscode.version;
  }

  public get window(): types.IVSCodeWindow {
    return this.vscode.window;
  }

  public get workspace(): types.IVSCodeWorkspace {
    return this.vscode.workspace;
  }

  public get supportsThemesReload(): boolean {
    const manifest: IVSCodeManifest = packageJson as IVSCodeManifest;
    const watchable: boolean =
      manifest &&
      manifest.contributes &&
      manifest.contributes.iconThemes.some(
        (theme: IVSCodeIconTheme): boolean => theme._watch,
      );
    return gte(this.version, this.supportsThemeReloadVersion) && watchable;
  }

  public get isSupportedVersion(): boolean {
    const manifest: IPackageManifest = packageJson as IPackageManifest;
    const minVersion = (
      (manifest && manifest.engines && coerce(manifest.engines.vscode)) ||
      parse('1.0.0')
    ).version;
    return gte(this.version, minVersion);
  }

  public getWorkspacePaths(): string[] {
    if (!this.workspace.workspaceFolders && !this.workspace.rootPath) {
      return [];
    }
    // 'workspaceFolders' on top of significance order
    if (this.workspace.workspaceFolders.length) {
      return this.workspace.workspaceFolders.reduce<string[]>(
        (a, b): string[] => {
          a.push(b.uri.fsPath);
          return a;
        },
        [],
      );
    }
    return [this.workspace.rootPath];
  }

  // Hopefully at some point we will get
  // an ExtensionContext#globalStoragePath
  // through the API and replace this
  public getAppUserDirPath(): string {
    // Reduce determining code usage
    // as the path needs to be calculated only once
    if (this.appUserDirPath) {
      return this.appUserDirPath;
    }
    const isDev = /dev/i.test(this.env.appName);
    const isOSS = !isDev && /oss/i.test(this.env.appName);
    const isInsiders = /insiders/i.test(this.env.appName);
    const appDataDirName = process.env.VSCODE_PORTABLE
      ? 'user-data'
      : isInsiders
        ? 'Code - Insiders'
        : isOSS
          ? 'Code - OSS'
          : isDev
            ? 'code-oss-dev'
            : 'Code';
    const appDataDirPath =
      process.env.VSCODE_PORTABLE || Utils.getAppDataDirPath();
    this.appUserDirPath = Utils.pathUnixJoin(
      appDataDirPath,
      appDataDirName,
      'User',
    );
    return this.appUserDirPath;
  }
}
