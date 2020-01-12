import { FileFormat, IFileCollection } from '../../src/models';
import { languages } from '../../src/iconsManifest/languages';

export const extensions: IFileCollection = {
  default: {
    file: { icon: 'file', format: FileFormat.svg },
  },
  supported: [
    { icon: 'actionscript', extensions: ['as'], format: FileFormat.svg },
    {
      icon: 'angular',
      extensions: [
        '.angular-cli.json',
        'angular-cli.json',
        'angular.json',
        '.angular.json',
      ],
      filename: true,
      format: FileFormat.svg,
    },
    {
      icon: 'asp',
      extensions: [],
      languages: [languages.asp],
      format: FileFormat.svg,
    },
    { icon: 'aspx', extensions: ['aspx', 'ascx'], format: FileFormat.svg },
    {
      icon: 'babel',
      extensions: ['.babelrc', '.babelignore'],
      filenamesGlob: ['.babelrc', 'babel.config'],
      extensionsGlob: ['js', 'cjs', 'mjs', 'json'],
      light: true,
      filename: true,
      format: FileFormat.svg,
    },
    {
      icon: 'babel2',
      extensions: ['.babelrc', '.babelignore'],
      filenamesGlob: ['.babelrc', 'babel.config'],
      extensionsGlob: ['js', 'cjs', 'mjs', 'json'],
      light: true,
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'config',
      extensions: ['plist'],
      light: true,
      languages: [languages.properties, languages.dotenv],
      format: FileFormat.svg,
    },
    {
      icon: 'docker',
      extensions: ['.dockerignore'],
      filenamesGlob: [
        'docker-compose',
        'docker-compose.ci-build',
        'docker-compose.override',
        'docker-compose.vs.debug',
        'docker-compose.vs.release',
        'docker-cloud',
      ],
      extensionsGlob: ['yml'],
      filename: true,
      languages: [languages.dockerfile],
      format: FileFormat.svg,
    },
    {
      icon: 'mlang',
      extensions: [],
      languages: [languages.mlang],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'nest_component_ts',
      extensions: ['component.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_component_js',
      extensions: ['component.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_controller_ts',
      extensions: ['controller.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_controller_js',
      extensions: ['controller.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_smart_component_ts',
      extensions: ['page.ts', 'container.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_smart_component_js',
      extensions: ['page.js', 'container.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_directive_ts',
      extensions: ['directive.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_directive_js',
      extensions: ['directive.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_pipe_ts',
      extensions: ['pipe.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_pipe_js',
      extensions: ['pipe.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_service_ts',
      extensions: ['service.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_service_js',
      extensions: ['service.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_module_ts',
      extensions: ['module.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_module_js',
      extensions: ['module.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_ts',
      extensions: ['routinest.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_js',
      extensions: ['routinest.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_ts',
      extensions: ['app-routinest.module.ts'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_js',
      extensions: ['app-routinest.module.js'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_component_ts2',
      extensions: ['component.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_component_js2',
      extensions: ['component.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_smart_component_ts2',
      extensions: ['page.ts', 'container.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_smart_component_js2',
      extensions: ['page.js', 'container.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_directive_ts2',
      extensions: ['directive.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_directive_js2',
      extensions: ['directive.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_pipe_ts2',
      extensions: ['pipe.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_pipe_js2',
      extensions: ['pipe.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_service_ts2',
      extensions: ['service.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_service_js2',
      extensions: ['service.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_module_ts2',
      extensions: ['module.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_module_js2',
      extensions: ['module.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_ts2',
      extensions: ['routinest.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_js2',
      extensions: ['routinest.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_ts2',
      extensions: ['app-routinest.module.ts'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'nest_routinest_js2',
      extensions: ['app-routinest.module.js'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_component_ts',
      extensions: ['component.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_component_js',
      extensions: ['component.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_controller_ts',
      extensions: ['controller.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_controller_js',
      extensions: ['controller.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_smart_component_ts',
      extensions: ['page.ts', 'container.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_smart_component_js',
      extensions: ['page.js', 'container.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_directive_ts',
      extensions: ['directive.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_directive_js',
      extensions: ['directive.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_pipe_ts',
      extensions: ['pipe.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_pipe_js',
      extensions: ['pipe.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_service_ts',
      extensions: ['service.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_service_js',
      extensions: ['service.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_module_ts',
      extensions: ['module.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_module_js',
      extensions: ['module.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_ts',
      extensions: ['routing.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_js',
      extensions: ['routing.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_ts',
      extensions: ['app-routing.module.ts'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_js',
      extensions: ['app-routing.module.js'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_component_ts2',
      extensions: ['component.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_component_js2',
      extensions: ['component.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_smart_component_ts2',
      extensions: ['page.ts', 'container.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_smart_component_js2',
      extensions: ['page.js', 'container.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_directive_ts2',
      extensions: ['directive.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_directive_js2',
      extensions: ['directive.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_pipe_ts2',
      extensions: ['pipe.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_pipe_js2',
      extensions: ['pipe.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_service_ts2',
      extensions: ['service.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_service_js2',
      extensions: ['service.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_module_ts2',
      extensions: ['module.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_module_js2',
      extensions: ['module.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_ts2',
      extensions: ['routing.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_js2',
      extensions: ['routing.js'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_ts2',
      extensions: ['app-routing.module.ts'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'ng_routing_js2',
      extensions: ['app-routing.module.js'],
      filename: true,
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'js',
      extensions: [],
      light: true,
      languages: [languages.javascript],
      format: FileFormat.svg,
    },
    {
      icon: 'js_official',
      extensions: [],
      languages: [languages.javascript],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'json',
      extensions: [],
      light: true,
      languages: [languages.json, languages.textmatejson, languages.jsonc],
      format: FileFormat.svg,
    },
    {
      icon: 'json_official',
      extensions: [],
      languages: [languages.json, languages.textmatejson, languages.jsonc],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'typescript',
      extensions: [],
      languages: [languages.typescript],
      format: FileFormat.svg,
    },
    {
      icon: 'typescript_official',
      extensions: [],
      languages: [languages.typescript],
      format: FileFormat.svg,
      disabled: true,
    },
    { icon: 'typescriptdef', extensions: ['d.ts'], format: FileFormat.svg },
    {
      icon: 'typescriptdef_official',
      extensions: ['d.ts'],
      format: FileFormat.svg,
      disabled: true,
    },
  ],
};
