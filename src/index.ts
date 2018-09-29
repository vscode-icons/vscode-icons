import { constants } from './constants';
import { IVSCodeExtensionContext, IExtensionManager, SYMBOLS } from './models';
import { CompositionRootService } from './services/compositionRootService';

export function activate(context: IVSCodeExtensionContext): void {
  const crs = new CompositionRootService(context);

  const extension: IExtensionManager = crs.get<IExtensionManager>(
    SYMBOLS.IExtensionManager
  );
  extension.activate();

  // tslint:disable-next-line no-console
  console.info(
    `[${constants.extension.name}] v${constants.extension.version} activated!`
  );
}

// this method is called when your vscode is closed
export function deactivate(): void {
  // no code here at the moment
}
