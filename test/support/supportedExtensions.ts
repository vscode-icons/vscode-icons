/* tslint:disable max-line-length */
import { languages } from '../../src/icon-manifest/languages';
import {
  IExtensionCollection,
  IFileExtension,
  FileFormat,
  IDefaultFileCollection,
  DefaultExtensionType,
} from '../../src/models';

export const extensions: (IExtensionCollection<IFileExtension> & IDefaultFileCollection) = {
  default: {
    file: { icon: 'file', type: DefaultExtensionType.file, format: FileFormat.svg },
  },
  supported: [
    { icon: 'actionscript', extensions: ['as'], format: FileFormat.svg },
    { icon: 'ng2_component_ts', extensions: ['component.ts'], format: FileFormat.svg },
    { icon: 'ng2_component_js', extensions: ['component.js'], format: FileFormat.svg },
    { icon: 'ng2_directive_ts', extensions: ['directive.ts'], format: FileFormat.svg },
    { icon: 'ng2_directive_js', extensions: ['directive.js'], format: FileFormat.svg },
    { icon: 'ng2_pipe_ts', extensions: ['pipe.ts'], format: FileFormat.svg },
    { icon: 'ng2_pipe_js', extensions: ['pipe.js'], format: FileFormat.svg },
    { icon: 'ng2_service_ts', extensions: ['service.ts'], format: FileFormat.svg },
    { icon: 'ng2_service_js', extensions: ['service.js'], format: FileFormat.svg },
    { icon: 'ng2_module_ts', extensions: ['module.ts'], format: FileFormat.svg },
    { icon: 'ng2_module_js', extensions: ['module.js'], format: FileFormat.svg },
    { icon: 'ng2_routing_ts', extensions: ['routing.ts'], format: FileFormat.svg },
    { icon: 'ng2_routing_js', extensions: ['routing.js'], format: FileFormat.svg },
    { icon: 'ng2_routing_ts', extensions: ['app-routing.module.ts'], filename: true, format: FileFormat.svg },
    { icon: 'ng2_routing_js', extensions: ['app-routing.module.js'], filename: true, format: FileFormat.svg },
  ],
};
