/* eslint-disable prefer-arrow-callback */
import { Debugger } from './common/debugger';
import { constants } from './constants';
import { IExtensionManager, IVSCodeExtensionContext, SYMBOLS } from './models';
import { CompositionRootService } from './services/compositionRootService';

export async function activate(
  context: IVSCodeExtensionContext,
): Promise<void> {
  const crs = new CompositionRootService(context);

  const extension: IExtensionManager = crs.get<IExtensionManager>(
    SYMBOLS.IExtensionManager,
  );
  await extension.activate();

  if (!Debugger.isAttached) {
    console.info(
      `[${constants.extension.name}] v${constants.extension.version} activated!`,
    );
  }
}

// this method is called when your vscode is closed
export function deactivate(): void {
  // no code here at the moment
}
