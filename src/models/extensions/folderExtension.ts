import { IExtension } from './extension';

export interface IFolderExtension extends IExtension {
  /** @internal */
  checked?: boolean;
}
