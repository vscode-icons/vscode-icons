import { FileFormat, IFolderCollection } from '../models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', format: FileFormat.svg },
    root_folder: { icon: 'root_folder', format: FileFormat.svg },
  },
  supported: [
    { icon: 'android', extensions: ['android'], format: FileFormat.svg },
    {
      icon: 'api',
      extensions: ['api', '.api', 'apis', '.apis'],
      format: FileFormat.svg,
    },
    {
      icon: 'app',
      extensions: ['app', 'apps', '.app', 'application', 'applications'],
      format: FileFormat.svg,
    },
    {
      icon: 'arangodb',
      extensions: ['arangodb', 'arango'],
      format: FileFormat.svg,
    },
    {
      icon: 'asset',
      extensions: ['assets', '.assets'],
      format: FileFormat.svg,
    },
    {
      icon: 'aurelia',
      extensions: ['aurelia_project'],
      format: FileFormat.svg,
    },
    {
      icon: 'audio',
      extensions: [
        'audio',
        '.audio',
        'audios',
        '.audios',
        'sound',
        '.sound',
        'sounds',
        '.sounds',
      ],
      format: FileFormat.svg,
    },
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
    { icon: 'azure', extensions: ['azure', '.azure'], format: FileFormat.svg },
    {
      icon: 'azurepipelines',
      extensions: ['azure-pipelines', '.azure-pipelines'],
      format: FileFormat.svg,
    },
    { icon: 'binary', extensions: ['bin', '.bin'], format: FileFormat.svg },
    { icon: 'bloc', extensions: ['blocs', 'bloc'], format: FileFormat.svg },
    {
      icon: 'blueprint',
      extensions: ['blueprint', '.blueprint', 'blueprints', '.blueprints'],
      format: FileFormat.svg,
    },
    { icon: 'bot', extensions: ['bot', '.bot'], format: FileFormat.svg },
    { icon: 'bower', extensions: ['bower_components'], format: FileFormat.svg },
    { icon: 'buildkite', extensions: ['.buildkite'], format: FileFormat.svg },
    { icon: 'cake', extensions: ['cake', '.cake'], format: FileFormat.svg },
    {
      icon: 'certificate',
      extensions: ['certificates', '.certificates', 'certs', 'certs.'],
      format: FileFormat.svg,
    },
    { icon: 'changesets', extensions: ['.changeset'], format: FileFormat.svg },
    { icon: 'chef', extensions: ['chef', '.chef'], format: FileFormat.svg },
    { icon: 'circleci', extensions: ['.circleci'], format: FileFormat.svg },
    {
      icon: 'controller',
      extensions: [
        'controller',
        'controllers',
        '.controllers',
        'handlers',
        '.handlers',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'component',
      extensions: [
        'component',
        'components',
        '.components',
        'gui',
        'src-ui',
        'ui',
        'widgets',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'composer',
      extensions: ['composer', '.composer'],
      format: FileFormat.svg,
    },
    {
      icon: 'cli',
      extensions: [
        'cli',
        'cmd',
        'command',
        'commands',
        'commandline',
        'console',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'client',
      extensions: ['client', 'clients'],
      format: FileFormat.svg,
    },
    { icon: 'cmake', extensions: ['.cmake', 'cmake'], format: FileFormat.svg },
    {
      icon: 'common',
      extensions: ['common'],
      format: FileFormat.svg,
    },
    {
      icon: 'config',
      extensions: [
        'conf',
        '.conf',
        'config',
        '.config',
        'configs',
        '.configs',
        'configuration',
        '.configuration',
        'configurations',
        '.configurations',
        'setting',
        '.setting',
        'settings',
        '.settings',
        'ini',
        '.ini',
        'initializers',
        '.initializers',
      ],
      format: FileFormat.svg,
    },
    { icon: 'coverage', extensions: ['coverage'], format: FileFormat.svg },
    {
      icon: 'css',
      extensions: ['css', '_css'],
      format: FileFormat.svg,
    },
    {
      icon: 'css2',
      extensions: ['css', '_css'],
      format: FileFormat.svg,
      disabled: true,
    },
    { icon: 'cubit', extensions: ['cubits', 'cubit'], format: FileFormat.svg },
    {
      icon: 'cypress',
      extensions: ['cypress'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'dapr',
      extensions: ['.dapr', 'dapr'],
      format: FileFormat.svg,
    },
    {
      icon: 'datadog',
      extensions: ['datadog', '.datadog'],
      format: FileFormat.svg,
    },
    {
      icon: 'db',
      extensions: [
        'db',
        'database',
        'sql',
        'data',
        'repo',
        'repository',
        'repositories',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'debian',
      extensions: ['debian', 'deb'],
      format: FileFormat.svg,
    },
    {
      icon: 'dependabot',
      extensions: ['.dependabot'],
      format: FileFormat.svg,
    },
    {
      icon: 'devcontainer',
      extensions: ['.devcontainer'],
      format: FileFormat.svg,
    },
    {
      icon: 'dist',
      extensions: [
        'dist',
        '.dist',
        'dists',
        'out',
        'outs',
        'export',
        'exports',
        'build',
        '.build',
        'builds',
        'release',
        'releases',
        'target',
        'targets',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'docker',
      extensions: ['docker', '.docker'],
      format: FileFormat.svg,
    },
    {
      icon: 'docs',
      extensions: ['docs', 'doc', 'document', 'documents'],
      format: FileFormat.svg,
    },
    { icon: 'e2e', extensions: ['e2e'], format: FileFormat.svg },
    {
      icon: 'elasticbeanstalk',
      extensions: ['.elasticbeanstalk', '.ebextensions'],
      format: FileFormat.svg,
    },
    {
      icon: 'electron',
      extensions: ['electron'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'expo',
      extensions: ['.expo', '.expo-shared'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'favicon',
      extensions: ['favicon', 'favicons'],
      format: FileFormat.svg,
    },
    {
      icon: 'frontcommerce',
      extensions: ['.front-commerce'],
      format: FileFormat.svg,
    },
    {
      icon: 'flow',
      extensions: ['flow', 'flow-typed'],
      format: FileFormat.svg,
    },
    {
      icon: 'fonts',
      extensions: ['fonts', 'font', 'fnt', 'webfonts'],
      light: true,
      format: FileFormat.svg,
    },
    { icon: 'gcp', extensions: ['gcp', '.gcp'], format: FileFormat.svg },
    {
      icon: 'git',
      extensions: ['.git', 'submodules', '.submodules'],
      format: FileFormat.svg,
    },
    { icon: 'github', extensions: ['.github'], format: FileFormat.svg },
    { icon: 'gitlab', extensions: ['.gitlab'], format: FileFormat.svg },
    {
      icon: 'gradle',
      extensions: ['gradle', '.gradle'],
      light: true,
      format: FileFormat.svg,
    },
    { icon: 'graphql', extensions: ['graphql'], format: FileFormat.svg },
    { icon: 'grunt', extensions: ['grunt'], format: FileFormat.svg },
    {
      icon: 'gulp',
      extensions: [
        'gulp',
        'gulpfile.js',
        'gulpfile.coffee',
        'gulpfile.ts',
        'gulpfile.babel.js',
        'gulpfile.babel.coffee',
        'gulpfile.babel.ts',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'haxelib',
      extensions: ['.haxelib', 'haxe_libraries'],
      format: FileFormat.svg,
    },
    {
      icon: 'helper',
      extensions: ['helper', '.helper', 'helpers', '.helpers'],
      format: FileFormat.svg,
    },
    {
      icon: 'hook',
      extensions: ['hook', '.hook', 'hooks', '.hooks'],
      format: FileFormat.svg,
    },
    {
      icon: 'husky',
      extensions: ['.husky'],
      format: FileFormat.svg,
    },
    { icon: 'idea', extensions: ['.idea'], format: FileFormat.svg },
    {
      icon: 'images',
      extensions: [
        'images',
        'image',
        'img',
        'imgs',
        'icons',
        'icon',
        'ico',
        'screenshot',
        'screenshots',
        'svg',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'include',
      extensions: [
        'include',
        'includes',
        'incl',
        'inc',
        '.include',
        '.includes',
        '.incl',
        '.inc',
        '_include',
        '_includes',
        '_incl',
        '_inc',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'interfaces',
      extensions: ['interface', 'interfaces'],
      format: FileFormat.svg,
    },
    { icon: 'ios', extensions: ['ios'], format: FileFormat.svg },
    { icon: 'js', extensions: ['js'], format: FileFormat.svg },
    { icon: 'json', extensions: ['json'], format: FileFormat.svg },
    {
      icon: 'json_official',
      extensions: ['json'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'kubernetes',
      extensions: [
        'kubernetes',
        'k8s',
        'kube',
        'kuber',
        '.kubernetes',
        '.k8s',
        '.kube',
        '.kuber',
      ],
      format: FileFormat.svg,
    },
    { icon: 'less', extensions: ['less', '_less'], format: FileFormat.svg },
    {
      icon: 'library',
      extensions: [
        'lib',
        'libs',
        '.lib',
        '.libs',
        '__lib__',
        '__libs__',
        'library',
        'libraries',
      ],
      format: FileFormat.svg,
    },
    { icon: 'linux', extensions: ['linux'], format: FileFormat.svg },
    {
      icon: 'locale',
      extensions: [
        'lang',
        'language',
        'languages',
        'locale',
        'locales',
        '_locale',
        '_locales',
        'internationalization',
        'globalization',
        'localization',
        'i18n',
        'g11n',
        'l10n',
      ],
      format: FileFormat.svg,
    },
    { icon: 'log', extensions: ['log', 'logs'], format: FileFormat.svg },
    { icon: 'macos', extensions: ['macos', 'darwin'], format: FileFormat.svg },
    {
      icon: 'mariadb',
      extensions: ['mariadb', 'maria'],
      format: FileFormat.svg,
    },
    { icon: 'maven', extensions: ['.mvn'], format: FileFormat.svg },
    {
      icon: 'mediawiki',
      extensions: ['mediawiki'],
      format: FileFormat.svg,
    },
    {
      icon: 'memcached',
      extensions: ['memcached', '.memcached'],
      format: FileFormat.svg,
    },
    {
      icon: 'meteor',
      extensions: ['.meteor'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'middleware',
      extensions: ['middleware', 'middlewares'],
      format: FileFormat.svg,
    },
    { icon: 'mjml', extensions: ['mjml', '.mjml'], format: FileFormat.svg },
    {
      icon: 'minecraft',
      extensions: ['.minecraft'],
      format: FileFormat.svg,
    },
    {
      icon: 'minikube',
      extensions: ['minikube', 'minik8s', 'minikuber'],
      format: FileFormat.svg,
    },
    {
      icon: 'mojo',
      extensions: ['mojo'],
      format: FileFormat.svg,
    },
    {
      icon: 'mock',
      extensions: ['mocks', '.mocks', '__mocks__'],
      format: FileFormat.svg,
    },
    {
      icon: 'model',
      extensions: [
        'model',
        '.model',
        'models',
        '.models',
        'entities',
        '.entities',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'module',
      extensions: ['modules'],
      format: FileFormat.svg,
    },
    {
      icon: 'mongodb',
      extensions: ['mongodb', 'mongo'],
      format: FileFormat.svg,
    },
    {
      icon: 'mypy',
      extensions: ['.mypy_cache'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'mysql',
      extensions: ['mysqldb', 'mysql'],
      light: true,
      format: FileFormat.svg,
    },

    {
      icon: 'netlify',
      extensions: ['netlify'],
      format: FileFormat.svg,
    },
    { icon: 'next', extensions: ['.next'], format: FileFormat.svg },
    { icon: 'nginx', extensions: ['nginx', 'conf.d'], format: FileFormat.svg },
    {
      icon: 'nix',
      extensions: ['.niv', '.nix', 'nix', 'niv'],
      format: FileFormat.svg,
    },
    {
      icon: 'node',
      extensions: ['node_modules'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'notebooks',
      extensions: ['notebooks', 'notebook'],
      format: FileFormat.svg,
    },
    {
      icon: 'notification',
      extensions: ['notification', 'notifications', 'event', 'events'],
      format: FileFormat.svg,
    },
    { icon: 'nuget', extensions: ['.nuget'], format: FileFormat.svg },
    {
      icon: 'package',
      extensions: ['package', 'packages', '.package', '.packages', 'pkg'],
      format: FileFormat.svg,
    },
    { icon: 'paket', extensions: ['.paket'], format: FileFormat.svg },
    { icon: 'php', extensions: ['php'], format: FileFormat.svg },
    {
      icon: 'platformio',
      extensions: ['.pio', '.pioenvs'],
      format: FileFormat.svg,
    },
    {
      icon: 'plugin',
      extensions: [
        'plugin',
        '.plugin',
        'plugins',
        '.plugins',
        'extension',
        '.extension',
        'extensions',
        '.extensions',
      ],
      format: FileFormat.svg,
    },
    { icon: 'prisma', extensions: ['prisma'], format: FileFormat.svg },
    {
      icon: 'private',
      extensions: ['private', '.private'],
      format: FileFormat.svg,
    },
    {
      icon: 'public',
      extensions: ['public', '.public'],
      format: FileFormat.svg,
    },
    {
      icon: 'pytest',
      extensions: ['.pytest_cache'],
      format: FileFormat.svg,
    },
    {
      icon: 'python',
      extensions: ['.venv', '.virtualenv', '__pycache__'],
      format: FileFormat.svg,
    },
    {
      icon: 'vercel',
      extensions: ['.vercel'],
      format: FileFormat.svg,
    },
    { icon: 'redis', extensions: ['redis'], format: FileFormat.svg },
    { icon: 'ravendb', extensions: ['ravendb'], format: FileFormat.svg },
    {
      icon: 'route',
      extensions: ['route', 'routes', '_route', '_routes', 'router', 'routers'],
      format: FileFormat.svg,
    },
    {
      icon: 'redux',
      extensions: ['redux'],
      light: true,
      format: FileFormat.svg,
    },

    {
      icon: 'nuxt',
      extensions: ['nuxt', '.nuxt'],
      format: FileFormat.svg,
    },
    {
      icon: 'sass',
      extensions: ['sass', 'scss', '_sass', '_scss'],
      light: true,
      format: FileFormat.svg,
    },
    {
      icon: 'script',
      extensions: ['script', 'scripts'],
      format: FileFormat.svg,
    },
    { icon: 'server', extensions: ['server'], format: FileFormat.svg },
    {
      icon: 'services',
      extensions: ['service', 'services'],
      format: FileFormat.svg,
    },
    {
      icon: 'shared',
      extensions: [
        'share',
        'shared',
        '.share',
        '.shared',
        '__shared__',
        '__share__',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'snaplet',
      extensions: ['.snaplet'],
      format: FileFormat.svg,
    },
    {
      icon: 'spin',
      extensions: ['.spin'],
      format: FileFormat.svg,
    },
    {
      icon: 'src',
      extensions: ['src', 'source', 'sources', '__src__'],
      format: FileFormat.svg,
    },
    {
      icon: 'sso',
      extensions: ['sso'],
      format: FileFormat.svg,
    },
    {
      icon: 'story',
      extensions: ['story', 'stories', '__stories__', '.storybook'],
      format: FileFormat.svg,
    },
    { icon: 'style', extensions: ['style', 'styles'], format: FileFormat.svg },
    {
      icon: 'supabase',
      extensions: ['supabase'],
      format: FileFormat.svg,
    },
    {
      icon: 'svelte',
      extensions: ['svelte', '.svelte-kit'],
      format: FileFormat.svg,
    },
    { icon: 'tauri', extensions: ['src-tauri'], format: FileFormat.svg },
    {
      icon: 'test',
      extensions: [
        'tests',
        '.tests',
        'test',
        '.test',
        '__tests__',
        '__test__',
        'spec',
        '.spec',
        'specs',
        '.specs',
        'integration',
      ],
      format: FileFormat.svg,
    },
    {
      icon: 'temp',
      extensions: ['temp', '.temp', 'tmp', '.tmp'],
      format: FileFormat.svg,
    },
    {
      icon: 'template',
      extensions: ['template', '.template', 'templates', '.templates'],
      format: FileFormat.svg,
    },
    { icon: 'theme', extensions: ['theme', 'themes'], format: FileFormat.svg },
    { icon: 'travis', extensions: ['.travis'], format: FileFormat.svg },
    {
      icon: 'tools',
      extensions: ['tool', 'tools', '.tools', 'util', 'utils', 'utilities'],
      format: FileFormat.svg,
    },
    {
      icon: 'trunk',
      extensions: ['.trunk'],
      format: FileFormat.svg,
    },
    {
      icon: 'turbo',
      extensions: ['.turbo'],
      format: FileFormat.svg,
    },
    {
      icon: 'typescript',
      extensions: ['typescript', 'ts'],
      format: FileFormat.svg,
    },
    {
      icon: 'typings',
      extensions: ['typings', 'types', '@types'],
      format: FileFormat.svg,
    },
    {
      icon: 'typings2',
      extensions: ['typings', 'types', '@types'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'vagrant',
      extensions: ['vagrant', '.vagrant'],
      format: FileFormat.svg,
    },
    {
      icon: 'video',
      extensions: ['video', '.video', 'videos', '.videos'],
      format: FileFormat.svg,
    },
    {
      icon: 'view',
      extensions: [
        'html',
        'view',
        'views',
        'layout',
        'layouts',
        'page',
        'pages',
        '_view',
        '_views',
        '_layout',
        '_layouts',
        '_page',
        '_pages',
      ],
      format: FileFormat.svg,
    },
    { icon: 'vs', extensions: ['.vs'], format: FileFormat.svg },
    {
      icon: 'vs2',
      extensions: ['.vs'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'vscode',
      extensions: ['.vscode', 'vscode'],
      format: FileFormat.svg,
    },
    {
      icon: 'vscode2',
      extensions: ['.vscode', 'vscode'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'vscode3',
      extensions: ['.vscode', 'vscode'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'vscode_test',
      extensions: ['.vscode-test'],
      format: FileFormat.svg,
    },
    {
      icon: 'vscode_test2',
      extensions: ['.vscode-test'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'vscode_test3',
      extensions: ['.vscode-test'],
      format: FileFormat.svg,
      disabled: true,
    },
    {
      icon: 'wit',
      extensions: ['wit'],
      format: FileFormat.svg,
    },
    {
      icon: 'webpack',
      extensions: ['webpack', '.webpack'],
      format: FileFormat.svg,
    },
    {
      icon: 'windows',
      extensions: ['windows', 'win32'],
      format: FileFormat.svg,
    },
    {
      icon: 'www',
      extensions: ['.web', 'www', 'wwwroot', 'web'],
      format: FileFormat.svg,
    },
    {
      icon: 'yarn',
      extensions: ['.yarn'],
      format: FileFormat.svg,
    },
  ],
};
