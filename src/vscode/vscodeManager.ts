import type * as types from '../types';
import type {
  PackageManifest,
  VSCodeIconTheme,
  VSCodeManifest,
} from '../types/package';

import { coerce, gte, parse } from 'semver';

import packageJson from '../../../package.json';
import { Utils } from '../utils';

export class VSCodeManager implements types.VSCodeManagerContract {
  private appUserDirPath: string;
  private supportsThemeReloadVersion = '1.34.0';

  constructor(
    private vscode: types.VSCode,
    private extensionContext: types.VSCodeExtensionContext,
  ) {
    if (!vscode) {
      throw new ReferenceError(`'vscode' not set to an instance`);
    }
    if (!extensionContext) {
      throw new ReferenceError(`'extensionContext' not set to an instance`);
    }
  }

  public get context(): types.VSCodeExtensionContext {
    return this.extensionContext;
  }

  public get env(): types.VSCodeEnv {
    return this.vscode.env;
  }

  public get commands(): types.VSCodeCommands {
    return this.vscode.commands;
  }

  public get version(): string {
    return this.vscode.version;
  }

  public get window(): types.VSCodeWindow {
    return this.vscode.window;
  }

  public get workspace(): types.VSCodeWorkspace {
    return this.vscode.workspace;
  }

  public get supportsThemesReload(): boolean {
    const manifest: VSCodeManifest = packageJson as VSCodeManifest;
    const watchable: boolean =
      manifest &&
      manifest.contributes &&
      manifest.contributes.iconThemes.some(
        (theme: VSCodeIconTheme): boolean => theme._watch,
      );
    return gte(this.version, this.supportsThemeReloadVersion) && watchable;
  }

  public get isSupportedVersion(): boolean {
    const manifest: PackageManifest = packageJson as PackageManifest;
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
