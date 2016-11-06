/* eslint-disable max-len */
var ctype = require('./contribTypes');
exports.extensions = {
  supported: [
    { icon: 'actionscript', extensions: ['as'] },
    { icon: 'angular', extensions: ['angular-cli.json'], contribType: ctype.filename },
    { icon: 'apache', extensions: ['htaccess', 'htpasswd'] },
    { icon: 'apib', extensions: ['apib'] },
    { icon: 'applescript', extensions: ['app'] },
    { icon: 'appveyor', extensions: ['appveyor.yml'], contribType: ctype.filename },
    { icon: 'ansible', extensions: ['ansible'] },
    { icon: 'asp', extensions: ['asp'] },
    { icon: 'aspx', extensions: ['aspx', 'ascx'] },
    { icon: 'assembly', extensions: ['s', 'asm'] },
    { icon: 'autohotkey', extensions: ['ahk'] },
    { icon: 'babel', extensions: ['babelrc'] },
    { icon: 'binary', extensions: ['bin', 'o', 'a', 'exe', 'obj', 'lib', 'dll', 'so', 'pyc', 'pyd', 'pyo', 'n', 'ndll', 'pdb', 'cmo', 'cmx', 'cma', 'cmxa', 'cmi'] }, // http://www.file-extensions.org/filetype/extension/name/binary-files
    { icon: 'blade', extensions: ['.blade.php'], contribOrder: 1 },
    { icon: 'bower', extensions: ['bowerrc'] },
    { icon: 'bower', extensions: ['bower.json'], contribType: ctype.filename },
    { icon: 'bundler', extensions: ['gemfile'], contribType: ctype.filename },
    { icon: 'bundler', extensions: ['gemfile.lock'], contribType: ctype.filename },
    { icon: 'c++', extensions: ['cpp', 'hpp', 'cc', 'cxx'] },
    { icon: 'c', extensions: ['c'] },
    { icon: 'cake', extensions: ['cake'] },
    { icon: 'cfm', extensions: ['cfm', 'cfc', 'lucee'] },
    { icon: 'cheader', extensions: ['h'] },
    { icon: 'clojure', extensions: ['clojure', 'cjm', 'clj', 'cljs', 'cljc', 'edn'] },
    { icon: 'cobol', extensions: ['cbl', 'cob', 'cpy'] },
    { icon: 'codeclimate', extensions: ['codeclimate.yml'], contribType: ctype.filename },
    { icon: 'coffeescript', extensions: ['coffee'] },
    { icon: 'config', extensions: ['env', 'ini', 'makefile', 'config', 'cfg'] },
    { icon: 'config', extensions: ['makefile'], contribType: ctype.filename },
    { icon: 'compass', extensions: [] },
    { icon: 'composer', extensions: ['composer.json'], contribType: ctype.filename },
    { icon: 'composer', extensions: ['composer.lock'], contribType: ctype.filename },
    { icon: 'cs', extensions: ['cs', 'csx'] },
    { icon: 'cshtml', extensions: ['cshtml'] },
    { icon: 'csproj', extensions: ['csproj'] },
    { icon: 'css', extensions: ['css'] },
    { icon: 'csslint', extensions: ['csslintrc'] },
    { icon: 'cssmap', extensions: ['.css.map'] },
    { icon: 'cucumber', extensions: ['feature'] },
    { icon: 'dartlang', extensions: ['dart'] },
    { icon: 'delphi', extensions: ['pas', 'dfm', 'dpr'] },
    { icon: 'dlang', extensions: ['d'] },
    { icon: 'docker', extensions: ['dockerfile', 'dockerignore'], contribType: ctype.filename },
    { icon: 'docker', extensions: ['dockerignore'] },
    { icon: 'docker', extensions: ['docker-compose.yml'], contribType: ctype.filename },
    { icon: 'editorconfig', extensions: ['editorconfig'] },
    { icon: 'ejs', extensions: ['ejs'] },
    { icon: 'elixir', extensions: ['ex', 'exs', 'eex'] },
    { icon: 'elm', extensions: ['elm'] },
    { icon: 'elm', extensions: ['elm-package.json'], contribType: ctype.filename, contribOrder: 1 },
    { icon: 'ember', extensions: ['ember-cli'], contribType: ctype.filename },
    { icon: 'erb', extensions: ['rhtml', 'erb'] },
    { icon: 'erlang', extensions: ['erl', 'hrl', 'emakefile', 'emakerfile'] },
    { icon: 'eslint', extensions: ['eslintrc', 'eslintignore'] },
    { icon: 'eslint', extensions: ['.eslintrc.js'], contribType: ctype.filename },
    { icon: 'eslint', extensions: ['.eslintrc.json'], contribType: ctype.filename },
    { icon: 'eslint', extensions: ['.eslintrc.yaml'], contribType: ctype.filename },
    { icon: 'eslint', extensions: ['.eslintrc.yml'], contribType: ctype.filename },
    { icon: 'excel', extensions: ['xls', 'xlsx', 'csv', 'ods'] },
    { icon: 'favicon', extensions: ['favicon.ico'], contribType: ctype.filename },
    { icon: 'flash', extensions: ['swf', 'swc', 'sol'] },
    { icon: 'flow', extensions: ['flowconfig', 'js.flow'] },
    { icon: 'fsharp', extensions: ['fs', 'fsx', 'fsi'] },
    { icon: 'font', extensions: ['woff', 'woff2', 'ttf', 'otf', 'eot', 'pfa', 'pfb', 'sfd'] },
    { icon: 'fortran', extensions: ['f90', 'mod', 'f'] },
    { icon: 'git', extensions: ['gitattributes', 'gitignore', 'gitmodules', 'gitkeep'] },
    { icon: 'gitlab', extensions: ['gitlab-ci.yml'], contribType: ctype.filename },
    { icon: 'go', extensions: ['go'] },
    { icon: 'gradle', extensions: ['gradle'] },
    { icon: 'graphviz', extensions: [] },
    { icon: 'groovy', extensions: ['groovy'] },
    { icon: 'gruntfile', extensions: ['gruntfile.js'], contribType: ctype.filename },
    { icon: 'gulpfile', extensions: ['gulpfile.js'], contribType: ctype.filename },
    { icon: 'haml', extensions: ['haml'] },
    { icon: 'handlebars', extensions: ['hbs', 'handlebars'] },
    { icon: 'haskell', extensions: ['has', 'hs', 'lhs', 'lit', 'gf'] },
    { icon: 'haxe', extensions: ['hx', 'hxml'] },
    { icon: 'haxe', extensions: ['haxelib.json'], contribType: ctype.filename },
    { icon: 'haxecheckstyle', extensions: ['checkstyle.json'], contribType: ctype.filename },
    { icon: 'haxedevelop', extensions: ['hxproj'] },
    { icon: 'html', extensions: ['htm', 'html'] },
    { icon: 'image', extensions: ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'ico'] },
    { icon: 'ionic', extensions: ['ionic.project'], contribType: ctype.filename },
    { icon: 'ionic', extensions: ['ionic.config.json'], contribType: ctype.filename },
    { icon: 'jade', extensions: ['jade', 'pug', 'jade-lintrc', 'pug-lintrc', 'tag'] },
    { icon: 'jade', extensions: ['.jade-lint.json'], contribType: ctype.filename },
    { icon: 'jade', extensions: ['.pug-lintrc.js'], contribType: ctype.filename },
    { icon: 'jade', extensions: ['.pug-lintrc.json'], contribType: ctype.filename },
    { icon: 'java', extensions: ['java'] },
    { icon: 'jinja', extensions: ['jinja'] },
    { icon: 'js', extensions: ['js'] },
    { icon: 'jshintrc', extensions: ['jshintrc'] },
    { icon: 'jsmap', extensions: ['.js.map'] },
    { icon: 'jsp', extensions: ['jsp'] },
    { icon: 'julia', extensions: ['jl'] },
    { icon: 'log', extensions: ['log'] },
    { icon: 'lerna', extensions: ['lerna.json'], contribType: ctype.filename },
    { icon: 'less', extensions: ['less'] },
    { icon: 'license', extensions: ['enc'] },
    { icon: 'license', extensions: ['license', 'licence'], contribType: ctype.filename },
    { icon: 'license', extensions: ['license.md', 'licence.md'], contribType: ctype.filename },
    { icon: 'lisp', extensions: ['bil'] },
    { icon: 'lime', extensions: ['hxp'] },
    { icon: 'lime', extensions: ['include.xml'], contribType: ctype.filename },
    { icon: 'lsl', extensions: ['lsl'] },
    { icon: 'lua', extensions: ['lua'] },
    { icon: 'm', extensions: ['m'] },
    { icon: 'markdown', extensions: ['md', 'markdown'] },
    { icon: 'marko', extensions: ['marko'] },
    { icon: 'markojs', extensions: ['.marko.js'] },
    { icon: 'markup', extensions: [] },
    { icon: 'matlab', extensions: ['fig', 'mat', 'mex', 'mexn', 'mexrs6', 'mn', 'mum', 'mx', 'mx3', 'rwd', 'slx', 'slddc', 'smv', 'tikz', 'xvc', 'xvc'] },
    { icon: 'masterpage', extensions: ['master'] },
    { icon: 'mustache', extensions: ['mustache', 'mst'] },
    { icon: 'nim', extensions: ['nim', 'nims'] },
    { icon: 'node', extensions: ['json', 'webmanifest'] },
    { icon: 'node2', extensions: ['nvmrc'] },
    { icon: 'npm', extensions: ['npmignore'] },
    { icon: 'npm', extensions: ['package.json'], contribType: ctype.filename },
    { icon: 'nsi', extensions: ['nsi', 'nsh'] },
    { icon: 'nuget', extensions: ['nuget', 'nupkg', 'nospec', 'psmdcp'] },
    { icon: 'nunjucks', extensions: ['njk', 'nunjucks', 'nunjs', 'nunj', 'njs', 'nj'] },
    { icon: 'ocaml', extensions: ['ml', 'mll', 'mli', 'mly', 'ocamlmakefile', 'merlin'] },
    { icon: 'paket', extensions: ['paket.dependencies'], contribType: ctype.filename },
    { icon: 'paket', extensions: ['paket.lock'], contribType: ctype.filename },
    { icon: 'paket', extensions: ['paket.references'], contribType: ctype.filename },
    { icon: 'paket', extensions: ['paket.template'], contribType: ctype.filename },
    { icon: 'paket', extensions: ['paket.local'], contribType: ctype.filename },
    { icon: 'patch', extensions: ['patch'] },
    { icon: 'perl', extensions: ['perl'] },
    { icon: 'poedit', extensions: ['po', 'mo'] },
    { icon: 'photoshop', extensions: ['psd'] },
    { icon: 'php', extensions: ['php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'phps', 'phpsa', 'phpt', 'phtml', 'phar'] },
    { icon: 'phpunit', extensions: ['phpunit.xml'], contribType: ctype.filename },
    { icon: 'plantuml', extensions: ['pu', 'plantuml', 'iuml', 'puml'] },
    { icon: 'procfile', extensions: ['procfile'] },
    { icon: 'prolog', extensions: ['P', 'pl', 'pro'] },
    { icon: 'postcss', extensions: ['pcss', 'postcss'] },
    { icon: 'powershell', extensions: ['ps1', 'psm1', 'psd1'] },
    { icon: 'protobuf', extensions: ['proto'] },
    { icon: 'puppet', extensions: ['epp', 'pp'] },
    { icon: 'python', extensions: ['py', 'pyw'] },
    { icon: 'qlikview', extensions: ['qvd', 'qvw'] },
    { icon: 'r', extensions: ['r'] },
    { icon: 'rails', extensions: [] },
    { icon: 'raml', extensions: ['raml'] },
    { icon: 'reactjs', extensions: ['jsx'] },
    { icon: 'reacttemplate', extensions: ['rt'] },
    { icon: 'reactts', extensions: ['tsx'] },
    { icon: 'rest', extensions: ['rest'] },
    { icon: 'riot', extensions: ['tag'] },
    { icon: 'robotframework', extensions: ['robot'] },
    { icon: 'rollup', extensions: ['rollup.config.js'], contribType: ctype.filename },
    { icon: 'rspec', extensions: ['rspec'] },
    { icon: 'ruby', extensions: ['rb', 'gemspec', 'ru', 'reek'] },
    { icon: 'ruby', extensions: ['rakefile'], contribType: ctype.filename },
    { icon: 'rust', extensions: ['rs'] },
    { icon: 'saltstack', extensions: ['sls'] },
    { icon: 'sass', extensions: ['sass'] },
    { icon: 'scala', extensions: ['scala'] },
    { icon: 'scss', extensions: ['scss'] },
    { icon: 'settings', extensions: [] },
    { icon: 'shell', extensions: ['bat', 'sh', 'cmd', 'bash', 'zsh', 'fish'] },
    { icon: 'slim', extensions: [] },
    { icon: 'sln', extensions: ['sln'] },
    { icon: 'smarty', extensions: ['tpl', 'swig'] },
    { icon: 'source', extensions: [] },
    { icon: 'sql', extensions: ['sql'] },
    { icon: 'sqlite', extensions: ['sqlite', 'sqlite3', 'db3'] },
    { icon: 'sss', extensions: ['sss'], svg: true },
    { icon: 'stylelint', extensions: ['stylelintrc'] },
    { icon: 'stylelint', extensions: ['stylelint.config.js'], contribType: ctype.filename },
    { icon: 'stylus', extensions: ['styl'] },
    { icon: 'storyboard', extensions: ['storyboard'] },
    { icon: 'svg', extensions: ['svg'] },
    { icon: 'swift', extensions: ['swift'] },
    { icon: 'tcl', extensions: ['tcl'] },
    { icon: 'terraform', extensions: ['tf', 'terra'] },
    { icon: 'testjs', extensions: ['.test.js', '.spec.js'] },
    { icon: 'testts', extensions: ['.test.ts', '.spec.ts'] },
    { icon: 'tex', extensions: ['texi', 'tex'] },
    { icon: 'text', extensions: ['txt'] },
    { icon: 'textile', extensions: ['textile'] },
    { icon: 'todo', extensions: ['todo'] },
    { icon: 'travis', extensions: ['.travis.yml'], contribType: ctype.filename },
    { icon: 'tslint', extensions: ['tslint.json'], contribType: ctype.filename },
    { icon: 'twig', extensions: ['twig'] },
    { icon: 'typescript', extensions: ['ts'] },
    { icon: 'typescriptdef', extensions: ['.d.ts'] },
    { icon: 'vagrant', extensions: ['vagrantfile'], contribType: ctype.filename },
    { icon: 'vash', extensions: ['vash'] },
    { icon: 'vb', extensions: ['vb'] },
    { icon: 'vbhtml', extensions: ['vbhtml'] },
    { icon: 'vbproj', extensions: ['vbproj'] },
    { icon: 'volt', extensions: ['volt'] },
    { icon: 'vue', extensions: ['vue'] },
    { icon: 'vscode', extensions: ['vscodeignore.json', 'launch.json', 'tasks.json', 'jsconfig.json', 'tsconfig.json'], contribType: ctype.filename },
    { icon: 'vscode', extensions: ['vscodeignore'] },
    { icon: 'webpack', extensions: ['webpack.config.js', 'webpack.config.babel.js', 'webpack.config.dev.js', 'webpack.config.staging.js', 'webpack.config.production.js', 'webpack.config.prod.js'], contribType: ctype.filename },
    { icon: 'webpack', extensions: ['webpack.config.ts'], contribType: ctype.filename },
    { icon: 'webpack', extensions: ['webpack.config.coffee'], contribType: ctype.filename },
    { icon: 'wxml', extensions: ['wxml'] },
    { icon: 'wxss', extensions: ['wxss'] },
    { icon: 'xib', extensions: ['xib'] },
    { icon: 'xliff', extensions: ['xliff', 'xlf'] },
    { icon: 'xml', extensions: ['xml', 'axml', 'xaml', 'pex', 'tmx'] },
    { icon: 'yaml', extensions: ['yml', 'yaml'] },
    { icon: 'yarn', extensions: ['yarnclean'] },
    { icon: 'yarn', extensions: ['yarn.lock'], contribType: ctype.filename },
    { icon: 'zip', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bzip2', 'xz', 'bz2'] }
  ]
};
