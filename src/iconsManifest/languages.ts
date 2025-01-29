import { ILanguage } from '../models';

export const languages = {
  actionscript: { ids: 'actionscript', defaultExtension: 'as' },
  ada: { ids: 'ada', defaultExtension: 'ada' },
  advpl: { ids: 'advpl', defaultExtension: 'prw' },
  affectscript: { ids: 'affectscript', defaultExtension: 'affect' },
  al: { ids: 'al', defaultExtension: 'al' },
  ansible: { ids: 'ansible', defaultExtension: 'ansible' },
  antlr: { ids: 'antlr', defaultExtension: 'g4' },
  anyscript: { ids: 'anyscript', defaultExtension: 'any' },
  apache: { ids: 'apacheconf', defaultExtension: 'htaccess' },
  apex: { ids: 'apex', defaultExtension: 'cls' },
  apib: { ids: 'apiblueprint', defaultExtension: 'apib' },
  apl: { ids: 'apl', defaultExtension: 'apl' },
  applescript: { ids: 'applescript', defaultExtension: 'applescript' },
  asciidoc: { ids: 'asciidoc', defaultExtension: 'adoc' },
  asp: { ids: ['asp', 'asp (html)'], defaultExtension: 'asp' },
  assembly: {
    ids: [
      'arm',
      'asm',
      'asm-intel-x86-generic',
      'platformio-debug.asm',
      'asm-collection',
    ],
    defaultExtension: 'asm',
  },
  astro: { ids: 'astro', defaultExtension: 'astro' },
  ats: { ids: ['ats'], defaultExtension: 'ats' },
  autohotkey: { ids: 'ahk', defaultExtension: 'ahk' },
  autoit: { ids: 'autoit', defaultExtension: 'au3' },
  automake: { ids: 'automake', defaultExtension: 'am' },
  avro: { ids: 'avro', defaultExtension: 'avcs' },
  azcli: { ids: 'azcli', defaultExtension: 'azcli' },
  azurepipelines: {
    ids: 'azure-pipelines',
    defaultExtension: 'azure-pipelines.yml',
  },
  ballerina: { ids: 'ballerina', defaultExtension: 'bal' },
  bat: { ids: 'bat', defaultExtension: 'bat' },
  bats: { ids: 'bats', defaultExtension: 'bats' },
  bazel: { ids: ['bazel', 'bazelrc'], defaultExtension: 'bzl' },
  befunge: { ids: ['befunge', 'befunge98'], defaultExtension: 'bf' },
  bicep: { ids: 'bicep', defaultExtension: 'bicep' },
  bibtex: { ids: 'bibtex', defaultExtension: 'bib' },
  biml: { ids: 'biml', defaultExtension: 'biml' },
  binary: { ids: 'code-text-binary', defaultExtension: 'bin' },
  biomesyntaxtree: { ids: 'biome_syntax_tree', defaultExtension: 'rast' },
  blade: { ids: ['blade', 'laravel-blade'], defaultExtension: 'blade.php' },
  blitzbasic: { ids: ['blitzbasic'], defaultExtension: 'blitzbasic' },
  bolt: { ids: 'bolt', defaultExtension: 'bolt' },
  bosque: { ids: 'bosque', defaultExtension: 'bsq' },
  browserslist: { ids: 'browserslist', defaultExtension: 'browserslist' },
  bruno: { ids: 'bruno', defaultExtension: 'bru' },
  buf: { ids: ['buf', 'buf-gen'], defaultExtension: 'buf.yaml' },
  bunlockb: { ids: 'bun.lockb', defaultExtension: 'lockb' },
  c: { ids: 'c', defaultExtension: 'c' },
  c_al: { ids: 'c-al', defaultExtension: 'cal' },
  cabal: { ids: 'cabal', defaultExtension: 'cabal' },
  caddyfile: { ids: 'caddyfile', defaultExtension: 'Caddyfile' },
  capnproto: { ids: ['capnp', 'capnproto'], defaultExtension: 'capnp' },
  casc: { ids: 'casc', defaultExtension: 'casc' },
  cddl: { ids: 'cddl', defaultExtension: 'cddl' },
  ceylon: { ids: 'ceylon', defaultExtension: 'ceylon' },
  cfc: { ids: 'cfc', defaultExtension: 'cfc' },
  cfm: { ids: ['cfmhtml'], defaultExtension: 'cfm' },
  clojure: { ids: 'clojure', defaultExtension: 'clojure' },
  clojurescript: { ids: 'clojurescript', defaultExtension: 'clojurescript' },
  cloudfoundrymanifest: { ids: 'manifest-yaml', defaultExtension: 'yml' },
  cmake: { ids: 'cmake', defaultExtension: 'cmake' },
  cmakecache: { ids: 'cmake-cache', defaultExtension: 'CMakeCache.txt' },
  cobol: { ids: 'cobol', defaultExtension: 'cbl' },
  codeql: { ids: 'ql', defaultExtension: 'ql' },
  coffeescript: { ids: 'coffeescript', defaultExtension: 'coffee' },
  coldfusion: { ids: ['cfml', 'lang-cfml'], defaultExtension: 'cfml' },
  confluence: { ids: ['confluence'], defaultExtension: 'confluence' },
  cookbook: { ids: 'cookbook', defaultExtension: 'ckbk' },
  cpp: { ids: 'cpp', defaultExtension: 'cpp' },
  crystal: { ids: 'crystal', defaultExtension: 'cr' },
  csharp: { ids: 'csharp', defaultExtension: 'cs' },
  css: { ids: 'css', defaultExtension: 'css' },
  csv: {
    ids: [
      'csv',
      'csv (pipe)',
      'csv (semicolon)',
      'csv (whitespace)',
      'dynamic csv',
      'tsv',
    ],
    defaultExtension: 'csv',
  },
  cucumber: { ids: ['cucumber', 'feature'], defaultExtension: 'feature' },
  cuda: { ids: ['cuda', 'cuda-cpp'], defaultExtension: 'cu' },
  cypher: { ids: 'cypher', defaultExtension: 'cypher' },
  cython: { ids: 'cython', defaultExtension: 'pyx' },
  dal: { ids: 'dal', defaultExtension: 'dal' },
  dart: { ids: 'dart', defaultExtension: 'dart' },
  debian: {
    ids: [
      'debian-changelog',
      'debian-control',
      'debian-copyright',
      'debian-upstream-metadata',
    ],
    defaultExtension: 'txt',
  },
  dhall: { ids: 'dhall', defaultExtension: 'dhall' },
  django: { ids: ['django-html', 'django-txt'], defaultExtension: 'html' },
  diff: { ids: 'diff', defaultExtension: 'diff' },
  dlang: { ids: ['d', 'dscript', 'dml', 'diet'], defaultExtension: 'd' },
  dockercompose: { ids: 'dockercompose', defaultExtension: 'yml' },
  dockerfile: { ids: 'dockerfile', defaultExtension: 'dockerfile' },
  doctex: { ids: 'doctex', defaultExtension: 'dtx' },
  dotenv: { ids: ['dotenv', 'env'], defaultExtension: 'env' },
  dotjs: { ids: 'dotjs', defaultExtension: 'dot' },
  doxygen: { ids: 'doxygen', defaultExtension: 'dox' },
  drawio: { ids: 'drawio', defaultExtension: 'drawio' },
  drools: { ids: 'drools', defaultExtension: 'drl' },
  dtd: { ids: 'dtd', defaultExtension: 'dtd' },
  dustjs: { ids: 'dustjs', defaultExtension: 'dust' },
  dylanlang: { ids: ['dylan', 'dylan-lid'], defaultExtension: 'dylan' },
  earthfile: { ids: 'earthfile', defaultExtension: 'earthfile' },
  edge: { ids: 'edge', defaultExtension: 'edge' },
  editorconfig: { ids: 'editorconfig', defaultExtension: 'editorconfig' },
  eex: { ids: ['eex', 'html-eex'], defaultExtension: 'eex' },
  elastic: { ids: 'es', defaultExtension: 'es' },
  elixir: { ids: 'elixir', defaultExtension: 'ex' },
  elm: { ids: 'elm', defaultExtension: 'elm' },
  erb: { ids: ['erb', 'html.erb'], defaultExtension: 'erb' },
  erlang: { ids: 'erlang', defaultExtension: 'erl' },
  esphome: { ids: 'esphome', defaultExtension: 'yaml' },
  excel: { ids: 'excel', defaultExtension: 'xlsx' },
  falcon: { ids: 'falcon', defaultExtension: 'falcon' },
  fauna: { ids: 'fql', defaultExtension: 'fql' },
  fortran: {
    ids: [
      'fortran',
      'fortran-modern',
      'FortranFreeForm',
      'FortranFixedForm',
      'fortran_fixed-form',
    ],
    defaultExtension: 'f',
  },
  freemarker: { ids: 'ftl', defaultExtension: 'ftl' },
  fsharp: { ids: 'fsharp', defaultExtension: 'fs' },
  fthtml: { ids: 'fthtml', defaultExtension: 'fthtml' },
  galen: { ids: 'galen', defaultExtension: 'gspec' },
  gamemaker: { ids: 'gml-gms', defaultExtension: 'gml' },
  gamemaker2: { ids: 'gml-gms2', defaultExtension: 'gml' },
  gamemaker81: { ids: 'gml-gm81', defaultExtension: 'gml' },
  gcode: { ids: 'gcode', defaultExtension: 'gcode' },
  genstat: { ids: 'genstat', defaultExtension: 'gen' },
  git: { ids: ['git-commit', 'git-rebase', 'ignore'], defaultExtension: 'git' },
  gleam: { ids: 'gleam', defaultExtension: 'gleam' },
  glsl: { ids: 'glsl', defaultExtension: 'glsl' },
  glyphs: { ids: 'glyphs', defaultExtension: 'glyphs' },
  gnuplot: { ids: 'gnuplot', defaultExtension: 'gp' },
  go: { ids: 'go', defaultExtension: 'go' },
  gomod: { ids: 'go.mod', defaultExtension: 'mod' },
  gowork: { ids: 'go.work', defaultExtension: 'work' },
  goctl: { ids: 'goctl', defaultExtension: 'api' },
  gdscript: { ids: 'gdscript', defaultExtension: 'gd' },
  gradle: { ids: 'gradle-kotlin-dsl', defaultExtension: 'gradle.kts' },
  grain: { ids: 'grain', defaultExtension: 'gr' },
  graphql: { ids: 'graphql', defaultExtension: 'gql' },
  graphviz: { ids: 'dot', defaultExtension: 'gv' },
  groovy: { ids: 'groovy', defaultExtension: 'groovy' },
  haml: { ids: 'haml', defaultExtension: 'haml' },
  handlebars: { ids: 'handlebars', defaultExtension: 'hbs' },
  harbour: { ids: 'harbour', defaultExtension: 'prg' },
  haskell: { ids: 'haskell', defaultExtension: 'hs' },
  haxe: { ids: ['haxe', 'hxml', 'Haxe AST dump'], defaultExtension: 'haxe' },
  hcl: { ids: ['hcl'], defaultExtension: 'hcl' },
  helm: { ids: 'helm', defaultExtension: 'helm.tpl' },
  hjson: { ids: 'hjson', defaultExtension: 'hjson' },
  hlsl: { ids: 'hlsl', defaultExtension: 'hlsl' },
  homeassistant: { ids: 'home-assistant', defaultExtension: 'yaml' },
  hosts: { ids: 'hosts', defaultExtension: 'hosts' },
  html: { ids: 'html', defaultExtension: 'html' },
  http: { ids: 'http', defaultExtension: 'http' },
  hunspell: { ids: ['hunspell.aff', 'hunspell.dic'], defaultExtension: 'aff' },
  hy: { ids: 'hy', defaultExtension: 'hy' },
  hypr: { ids: 'hypr', defaultExtension: 'hypr' },
  icl: { ids: 'icl', defaultExtension: 'icl' },
  imba: { ids: 'imba', defaultExtension: 'imba' },
  informix: { ids: '4GL', defaultExtension: '4gl' },
  ini: { ids: 'ini', defaultExtension: 'ini' },
  ink: { ids: 'ink', defaultExtension: 'ink' },
  innosetup: { ids: 'innosetup', defaultExtension: 'iss' },
  io: { ids: 'io', defaultExtension: 'io' },
  janet: { ids: 'janet', defaultExtension: 'janet' },
  java: { ids: 'java', defaultExtension: 'java' },
  javascript: { ids: 'javascript', defaultExtension: 'js' },
  javascriptreact: { ids: 'javascriptreact', defaultExtension: 'jsx' },
  jekyll: { ids: 'jekyll', defaultExtension: 'jekyll' },
  jenkins: {
    ids: ['jenkins', 'declarative', 'jenkinsfile'],
    defaultExtension: 'jenkins',
  },
  jestsnapshot: { ids: 'jest-snapshot', defaultExtension: 'Jest-snap' },
  jinja: {
    ids: [
      'jinja',
      'jinja-java',
      'jinja-html',
      'jinja-xml',
      'jinja-css',
      'jinja-json',
      'jinja-md',
      'jinja-py',
      'jinja-rb',
      'jinja-js',
      'jinja-yaml',
      'jinja-toml',
      'jinja-latex',
      'jinja-lua',
      'jinja-properties',
      'jinja-shell',
      'jinja-dockerfile',
      'jinja-sql',
      'jinja-terraform',
      'jinja-nginx',
      'jinja-groovy',
      'jinja-systemd',
      'jinja-cpp',
    ],
    defaultExtension: 'jinja',
  },
  json: { ids: 'json', defaultExtension: 'json' },
  jsonc: { ids: 'jsonc', defaultExtension: 'jsonc' },
  jsonl: { ids: 'jsonl', defaultExtension: 'jsonl' },
  jsonnet: { ids: 'jsonnet', defaultExtension: 'jsonnet' },
  json5: { ids: 'json5', defaultExtension: 'json5' },
  julia: { ids: ['julia', 'juliamarkdown'], defaultExtension: 'jl' },
  just: { ids: 'just', defaultExtension: 'justfile' },
  iodine: { ids: 'iodine', defaultExtension: 'id' },
  k: { ids: 'k', defaultExtension: 'k' },
  kivy: { ids: 'kivy', defaultExtension: 'kv' },
  kos: { ids: 'kos', defaultExtension: 'ks' },
  kotlin: { ids: ['kotlin', 'kotlinscript'], defaultExtension: 'kt' },
  kusto: { ids: 'kusto', defaultExtension: '.kusto' },
  latex: { ids: 'latex', defaultExtension: 'tex' },
  lark: { ids: 'lark', defaultExtension: 'lark' },
  latino: { ids: 'latino', defaultExtension: 'lat' },
  less: { ids: 'less', defaultExtension: 'less' },
  lex: { ids: 'lex', defaultExtension: 'flex' },
  lilypond: { ids: 'lilypond', defaultExtension: 'ly' },
  lisp: { ids: ['lisp', 'autolisp', 'autolispdcl'], defaultExtension: 'lisp' },
  literatehaskell: { ids: ['literate haskell'], defaultExtension: 'lhs' },
  log: { ids: 'log', defaultExtension: 'log' },
  lolcode: { ids: 'lolcode', defaultExtension: 'lol' },
  lsl: { ids: 'lsl', defaultExtension: 'lsl' },
  lua: { ids: 'lua', defaultExtension: 'lua' },
  m4: { ids: 'm4', defaultExtension: 'm4' },
  makefile: { ids: ['makefile', 'makefile2'], defaultExtension: 'mk' },
  markdown: { ids: 'markdown', defaultExtension: 'md' },
  marko: { ids: 'marko', defaultExtension: 'marko' },
  matlab: { ids: 'matlab', defaultExtension: 'mat' },
  maxscript: { ids: 'maxscript', defaultExtension: 'ms' },
  mdx: { ids: 'mdx', defaultExtension: 'mdx' },
  mediawiki: { ids: 'mediawiki', defaultExtension: 'mediawiki' },
  mel: { ids: 'mel', defaultExtension: 'mel' },
  mermaid: { ids: 'mermaid', defaultExtension: 'mmd' },
  meson: { ids: 'meson', defaultExtension: 'meson.build' },
  minecraft: {
    ids: [
      'bc-mcfunction',
      'bc-minecraft-language',
      'bc-minecraft-molang',
      'bc-minecraft-project',
      'mcdoc',
      'mcfunction',
      'mcmeta',
      'mcscript',
      'minecraft-lang',
      'options-txt',
      'snbt',
    ],
    defaultExtension: 'mcfunction',
  },
  mjml: { ids: 'mjml', defaultExtension: 'mjml' },
  mlang: { ids: ['powerquery'], defaultExtension: 'pq' },
  mojo: { ids: 'mojo', defaultExtension: 'mojo' },
  mojolicious: { ids: 'mojolicious', defaultExtension: 'ep' },
  mongo: { ids: 'mongo', defaultExtension: 'mongo' },
  mson: { ids: 'mson', defaultExtension: 'mson' },
  mv: { ids: 'mv', defaultExtension: 'mv' },
  mvt: { ids: 'mvt', defaultExtension: 'mvt' },
  mvtcss: { ids: 'mvtcss', defaultExtension: 'mvt' },
  mvtjs: { ids: 'mvtjs', defaultExtension: 'mvt' },
  nearley: { ids: 'nearley', defaultExtension: 'ne' },
  nextflow: { ids: 'nextflow', defaultExtension: 'nf' },
  nginx: { ids: ['nginx'], defaultExtension: 'nginx' },
  nim: { ids: 'nim', defaultExtension: 'nim' },
  nimble: { ids: 'nimble', defaultExtension: 'nimble' },
  nix: { ids: 'nix', defaultExtension: 'nix' },
  nsis: { ids: ['nsis', 'nfl', 'nsl', 'bridlensis'], defaultExtension: 'nsi' },
  nunjucks: { ids: 'nunjucks', defaultExtension: 'nunjucks' },
  objectivec: { ids: 'objective-c', defaultExtension: 'm' },
  objectivecpp: { ids: 'objective-cpp', defaultExtension: 'mm' },
  ocaml: { ids: ['ocaml', 'ocamllex', 'menhir'], defaultExtension: 'ml' },
  ogone: { ids: 'ogone', defaultExtension: 'o3' },
  openEdge: { ids: 'abl', defaultExtension: 'w' },
  openHAB: { ids: 'openhab', defaultExtension: 'things' },
  org: { ids: 'org', defaultExtension: 'org' },
  pascal: { ids: ['pascal', 'objectpascal'], defaultExtension: 'pas' },
  pddl: { ids: 'pddl', defaultExtension: 'pddl' },
  pddlplan: { ids: 'plan', defaultExtension: 'plan' },
  pddlhappenings: { ids: 'happenings', defaultExtension: 'happenings' },
  perl: { ids: 'perl', defaultExtension: 'pl' },
  perl6: { ids: 'perl6', defaultExtension: 'pl6' },
  pgsql: { ids: 'pgsql', defaultExtension: 'pgsql' },
  php: { ids: 'php', defaultExtension: 'php' },
  pine: { ids: ['pine', 'pinescript'], defaultExtension: 'pine' },
  pip: { ids: 'pip-requirements', defaultExtension: 'requirements.txt' },
  plaintext: { ids: ['plaintext', 'vim-help'], defaultExtension: 'txt' },
  platformio: {
    ids: [
      'platformio-debug.disassembly',
      'platformio-debug.memoryview',
      'platformio-debug.asm',
    ],
    defaultExtension: 'dbgasm',
  },
  plsql: {
    ids: ['plsql', 'oracle', 'oraclesql', 'oracle-sql'],
    defaultExtension: 'ddl',
  },
  po: { ids: 'po', defaultExtension: 'po' },
  polymer: { ids: 'polymer', defaultExtension: 'polymer' },
  pony: { ids: 'pony', defaultExtension: 'pony' },
  postcss: { ids: 'postcss', defaultExtension: 'pcss' },
  powershell: { ids: 'powershell', defaultExtension: 'ps1' },
  prisma: { ids: 'prisma', defaultExtension: 'prisma' },
  processinglang: { ids: 'pde', defaultExtension: 'pde' },
  prolog: { ids: 'prolog', defaultExtension: 'pro' },
  prometheus: { ids: 'prometheus', defaultExtension: 'rules' },
  properties: {
    ids: ['java-properties', 'properties'],
    defaultExtension: 'properties',
  },
  protobuf: {
    ids: ['proto3', 'proto', 'prototext'],
    defaultExtension: 'proto',
  },
  pug: { ids: 'jade', defaultExtension: 'pug' },
  puppet: { ids: 'puppet', defaultExtension: 'pp' },
  purescript: { ids: 'purescript', defaultExtension: 'purs' },
  pyret: { ids: 'pyret', defaultExtension: 'arr' },
  pyscript: { ids: 'pyscript', defaultExtension: 'pyscript' },
  python: { ids: 'python', defaultExtension: 'py' },
  pythowo: { ids: 'pythowo', defaultExtension: 'pyowo' },
  qlik: { ids: 'qlik', defaultExtension: 'qvs' },
  qml: { ids: 'qml', defaultExtension: 'qml' },
  qsharp: { ids: 'qsharp', defaultExtension: 'qs' },
  r: { ids: 'r', defaultExtension: 'r' },
  racket: { ids: 'racket', defaultExtension: 'rkt' },
  raku: { ids: 'raku', defaultExtension: 'raku' },
  razor: { ids: ['razor', 'aspnetcorerazor'], defaultExtension: 'cshtml' },
  raml: { ids: 'raml', defaultExtension: 'raml' },
  rast: { ids: 'ra_syntax_tree', defaultExtension: 'rast' },
  reason: { ids: 'reason', defaultExtension: 're' },
  red: { ids: 'red', defaultExtension: 'red' },
  rescript: { ids: 'rescript', defaultExtension: 'res' },
  restructuredtext: { ids: 'restructuredtext', defaultExtension: 'rst' },
  rexx: { ids: 'rexx', defaultExtension: 'rex' },
  riot: { ids: 'riot', defaultExtension: 'tag' },
  rmd: { ids: 'rmd', defaultExtension: 'rmd' },
  rnc: { ids: 'rnc', defaultExtension: 'rnc' },
  robot: { ids: 'robot', defaultExtension: 'robot' },
  ruby: { ids: 'ruby', defaultExtension: 'rb' },
  rust: { ids: 'rust', defaultExtension: 'rs' },
  s_lang: { ids: 's-lang', defaultExtension: 'sl' },
  san: { ids: 'san', defaultExtension: 'san' },
  sas: { ids: 'SAS', defaultExtension: 'sas' },
  sass: { ids: ['sass', 'sass.hover'], defaultExtension: 'sass' },
  sbt: { ids: 'sbt', defaultExtension: 'sbt' },
  scad: { ids: 'scad', defaultExtension: 'scad' },
  scala: { ids: 'scala', defaultExtension: 'scala' },
  scilab: { ids: 'scilab', defaultExtension: 'sce' },
  scss: { ids: 'scss', defaultExtension: 'scss' },
  sdlang: { ids: 'sdl', defaultExtension: 'sdl' },
  searchresult: { ids: 'search-result', defaultExtension: 'code-search' },
  shaderlab: { ids: 'shaderlab', defaultExtension: 'shader' },
  shellscript: { ids: 'shellscript', defaultExtension: 'sh' },
  slang: { ids: 'slang', defaultExtension: 'slang' },
  slice: { ids: ['slice'], defaultExtension: 'ice' },
  slim: { ids: ['slim'], defaultExtension: 'slim' },
  slint: { ids: ['slint'], defaultExtension: 'slint' },
  sln: { ids: 'sln', defaultExtension: 'sln' },
  silverstripe: { ids: 'silverstripe', defaultExtension: 'ss' },
  sino: { ids: 'sino', defaultExtension: 'sn' },
  skipper: { ids: ['eskip'], defaultExtension: 'eskip' },
  smarty: { ids: ['smarty'], defaultExtension: 'tpl' },
  snakemake: { ids: ['snakemake'], defaultExtension: 'smk' },
  snippets: { ids: 'snippets', defaultExtension: 'code-snippets' },
  snort: { ids: ['snort'], defaultExtension: 'snort' },
  solidity: { ids: ['solidity'], defaultExtension: 'sol' },
  sparql: { ids: 'sparql', defaultExtension: 'rq' },
  springbootproperties: {
    ids: 'spring-boot-properties',
    defaultExtension: 'properties',
  },
  springbootpropertiesyaml: {
    ids: 'spring-boot-properties-yaml',
    defaultExtension: 'yml',
  },
  sqf: { ids: 'sqf', defaultExtension: 'sqf' },
  sql: { ids: 'sql', defaultExtension: 'sql' },
  squirrel: { ids: 'squirrel', defaultExtension: 'nut' },
  stan: { ids: 'stan', defaultExtension: 'stan' },
  starlark: { ids: 'starlark', defaultExtension: 'bazel' },
  stata: { ids: 'stata', defaultExtension: 'do' },
  stencil: { ids: 'stencil', defaultExtension: 'stencil' },
  stencilhtml: { ids: 'stencil-html', defaultExtension: 'html.stencil' },
  stylable: { ids: 'stylable', defaultExtension: 'st.css' },
  styled: { ids: 'source.css.styled', defaultExtension: 'styled' },
  stylus: { ids: 'stylus', defaultExtension: 'styl' },
  svelte: { ids: 'svelte', defaultExtension: 'svelte' },
  svg: { ids: 'svg', defaultExtension: 'svg' },
  swagger: { ids: ['Swagger', 'swagger'], defaultExtension: 'swagger' },
  swift: { ids: 'swift', defaultExtension: 'swift' },
  swig: { ids: 'swig', defaultExtension: 'swig' },
  systemd: {
    ids: ['systemd-conf', 'systemd-unit-file'],
    defaultExtension: 'link',
  },
  systemverilog: { ids: 'systemverilog', defaultExtension: 'sv' },
  t4: { ids: 't4', defaultExtension: 'tt' },
  tailwindcss: { ids: 'tailwindcss', defaultExtension: 'css' },
  teal: { ids: 'teal', defaultExtension: 'teal' },
  templ: { ids: 'templ', defaultExtension: 'templ' },
  templatetoolkit: { ids: 'tt', defaultExtension: 'tt3' },
  tera: { ids: 'tera', defaultExtension: 'tera' },
  terraform: { ids: 'terraform', defaultExtension: 'tf' },
  tex: { ids: 'tex', defaultExtension: 'sty' },
  textile: { ids: 'textile', defaultExtension: 'textile' },
  textmatejson: { ids: 'json-tmlanguage', defaultExtension: 'JSON-tmLanguage' },
  textmateyaml: { ids: 'yaml-tmlanguage', defaultExtension: 'YAML-tmLanguage' },
  tiltfile: { ids: 'tiltfile', defaultExtension: 'Tiltfile' },
  toit: { ids: 'toit', defaultExtension: 'toit' },
  toml: { ids: 'toml', defaultExtension: 'toml' },
  ttcn: { ids: 'ttcn', defaultExtension: 'ttcn3' },
  tuc: { ids: 'tuc', defaultExtension: 'tuc' },
  twig: { ids: 'twig', defaultExtension: 'twig' },
  typescript: { ids: 'typescript', defaultExtension: 'ts' },
  typescriptreact: { ids: 'typescriptreact', defaultExtension: 'tsx' },
  typo3: { ids: 'typoscript', defaultExtension: 'typoscript' },
  uiua: { ids: 'uiua', defaultExtension: 'ua' },
  unison: { ids: 'unison', defaultExtension: 'u' },
  vb: { ids: 'vb', defaultExtension: 'vb' },
  vba: { ids: 'vba', defaultExtension: 'cls' },
  vbscript: { ids: 'vbscript', defaultExtension: 'wsf' },
  velocity: { ids: 'velocity', defaultExtension: 'vm' },
  vento: { ids: 'vento', defaultExtension: 'vto' },
  verilog: { ids: 'verilog', defaultExtension: 'v' },
  vhdl: { ids: 'vhdl', defaultExtension: 'vhdl' },
  viml: { ids: ['viml', 'vim-snippet'], defaultExtension: 'vim' },
  vitestsnapshot: { ids: 'vitest-snapshot', defaultExtension: 'Vitest-snap' },
  vlang: { ids: 'v', defaultExtension: 'v' },
  volt: { ids: 'volt', defaultExtension: 'volt' },
  vue: { ids: 'vue', defaultExtension: 'vue' },
  vyper: { ids: 'vyper', defaultExtension: 'vy' },
  wai: { ids: ['wai'], defaultExtension: 'wai' },
  wasm: { ids: ['wasm', 'wat'], defaultExtension: 'wasm' },
  wenyan: { ids: 'wenyan', defaultExtension: 'wy' },
  wgsl: { ids: 'wgsl', defaultExtension: 'wgsl' },
  wikitext: { ids: 'wikitext', defaultExtension: 'wt' },
  wolfram: { ids: 'wolfram', defaultExtension: 'wl' },
  wurst: { ids: ['wurstlang', 'wurst'], defaultExtension: 'wurst' },
  wxml: { ids: 'wxml', defaultExtension: 'wxml' },
  xcompose: { ids: 'xcompose', defaultExtension: 'xcompose' },
  xmake: { ids: 'xmake', defaultExtension: 'xmake.lua' },
  xml: { ids: 'xml', defaultExtension: 'xml' },
  xquery: { ids: 'xquery', defaultExtension: 'xquery' },
  xsl: { ids: ['xsl', 'xslt'], defaultExtension: 'xsl' },
  yacc: { ids: 'yacc', defaultExtension: 'bison' },
  yaml: { ids: 'yaml', defaultExtension: 'yaml' },
  yang: { ids: 'yang', defaultExtension: 'yang' },
  yarnlock: { ids: 'yarnlock', defaultExtension: 'lock' },
  zig: { ids: 'zig', defaultExtension: 'zig' },
  zip: { ids: 'zip', defaultExtension: 'zip' },
} satisfies Record<string, ILanguage>;
