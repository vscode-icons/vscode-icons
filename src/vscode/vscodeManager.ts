import * as models from '../models';
import { Utils } from '../utils';

export class VSCodeManager implements models.IVSCodeManager {
  private appUserDirPath: string;

  constructor(
    private vscode: models.IVSCode,
    private extensionContext: models.IVSCodeExtensionContext
  ) {
    if (!vscode) {
      throw new ReferenceError(`'vscode' not set to an instance`);
    }
    if (!extensionContext) {
      throw new ReferenceError(`'extensionContext' not set to an instance`);
    }
  }

  public get context(): models.IVSCodeExtensionContext {
    return this.extensionContext;
  }

  public get env(): models.IVSCodeEnv {
    return this.vscode.env;
  }

  public get commands(): models.IVSCodeCommands {
    return this.vscode.commands;
  }

  public get version(): string {
    return this.vscode.version;
  }

  public get window(): models.IVSCodeWindow {
    return this.vscode.window;
  }

  public get workspace(): models.IVSCodeWorkspace {
    return this.vscode.workspace;
  }

  public getWorkspacePaths(): string[] {
    if (!this.workspace.workspaceFolders && !this.workspace.rootPath) {
      return [];
    }
    // 'workspaceFolders' on top of significance order
    if (this.workspace.workspaceFolders.length) {
      return this.workspace.workspaceFolders.reduce<string[]>((a, b) => {
        a.push(b.uri.fsPath);
        return a;
      }, []);
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
      'User'
    );
    return this.appUserDirPath;
  }
}
