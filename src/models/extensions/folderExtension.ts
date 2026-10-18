import type { IExtension } from './extension';

export interface IFolderExtension extends IExtension {
  /** @internal */
  checked?: boolean;
}
