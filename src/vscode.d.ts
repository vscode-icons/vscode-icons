import { WorkspaceConfiguration } from 'vscode';
import { IVSIcons } from './models/contributions';

declare module 'vscode' {
  interface WorkspaceConfiguration {
    vsicons: IVSIcons;
  }

  // The following definitions are added to support editor versions prior of '1.15'
  // Can be safely removed once the minimun supported `vscode` version gets greater than or equal to '1.15'
  namespace workspace {
    /**
     * List of workspace folders or `undefined` when no folder is open.
     * *Note* that the first entry corresponds to the value of `rootPath`.
     *
     * @readonly
     */
    export let workspaceFolders: WorkspaceFolder[] | undefined;
  }

  // The following definitions are added to support editor versions prior of '1.15'
  // Can be safely removed once the minimun supported `vscode` version gets greater than or equal to '1.15'
  interface WorkspaceFolder {
    /**
     * The associated uri for this workspace folder.
     *
     * *Note:* The [Uri](#Uri)-type was intentionally chosen such that future releases of the editor can support
     * workspace folders that are not stored on the local disk, e.g. `ftp://server/workspaces/foo`.
     */
    readonly uri: Uri;

    /**
     * The name of this workspace folder. Defaults to
     * the basename of its [uri-path](#Uri.path)
     */
    readonly name: string;

    /**
     * The ordinal number of this workspace folder.
     */
    readonly index: number;
  }
}
