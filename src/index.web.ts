/* eslint-disable prefer-arrow-callback */
import { constants } from './constants';
import { IVSCodeExtensionContext } from './models';

// NOTE: this entrypoint is used to provide a minimal extension for the web.
// The web version of the extension is not fully functional. It only provides icons.
// No commands are available.

export function activate(_context: IVSCodeExtensionContext): void {
  console.info(
    `[${constants.extension.name}] v${constants.extension.version} (WEB) activated!`,
  );
}

// this method is called when your vscode is closed
export function deactivate(): void {
  // no code here at the moment
}
