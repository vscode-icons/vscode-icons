import { ILanguage } from './language';
import { INativeLanguageCollection } from './nativeLanguageCollection';

export interface ILanguageCollection extends INativeLanguageCollection {
  actionscript: ILanguage;
  ada: ILanguage;
  advpl: ILanguage;
  affectscript: ILanguage;
  al: ILanguage;
  ansible: ILanguage;
  antlr: ILanguage;
  anyscript: ILanguage;
  apache: ILanguage;
  apex: ILanguage;
  apib: ILanguage;
  apl: ILanguage;
  applescript: ILanguage;
  asciidoc: ILanguage;
  asp: ILanguage;
  astro: ILanguage;
  ats: ILanguage;
  assembly: ILanguage;
  autohotkey: ILanguage;
  autoit: ILanguage;
  automake: ILanguage;
  avro: ILanguage;
  azcli: ILanguage;
  azurepipelines: ILanguage;
  ballerina: ILanguage;
  bats: ILanguage;
  bazel: ILanguage;
  bicep: ILanguage;
  befunge: ILanguage;
  bibtex: ILanguage;
  biml: ILanguage;
  binary: ILanguage;
  blade: ILanguage;
  blitzbasic: ILanguage;
  bolt: ILanguage;
  bosque: ILanguage;
  browserslist: ILanguage;
  bruno: ILanguage;
  buf: ILanguage;
  // eslint-disable-next-line camelcase
  c_al: ILanguage;
  cabal: ILanguage;
  caddyfile: ILanguage;
  casc: ILanguage;
  cddl: ILanguage;
  cfc: ILanguage;
  cfm: ILanguage;
  cloudfoundrymanifest: ILanguage;
  cmake: ILanguage;
  cmakecache: ILanguage;
  cobol: ILanguage;
  codeql: ILanguage;
  coldfusion: ILanguage;
  confluence: ILanguage;
  cookbook: ILanguage;
  crystal: ILanguage;
  csharp: ILanguage;
  cucumber: ILanguage;
  cuda: ILanguage;
  cython: ILanguage;
  dal: ILanguage;
  dart: ILanguage;
  debian: ILanguage;
  dhall: ILanguage;
  django: ILanguage;
  dlang: ILanguage;
  dockercompose: ILanguage;
  doctex: ILanguage;
  dotenv: ILanguage;
  dotjs: ILanguage;
  doxygen: ILanguage;
  drawio: ILanguage;
  drools: ILanguage;
  dtd: ILanguage;
  dustjs: ILanguage;
  dylanlang: ILanguage;
  earthfile: ILanguage;
  edge: ILanguage;
  editorconfig: ILanguage;
  eex: ILanguage;
  elastic: ILanguage;
  elixir: ILanguage;
  elm: ILanguage;
  erb: ILanguage;
  erlang: ILanguage;
  esphome: ILanguage;
  excel: ILanguage;
  falcon: ILanguage;
  fauna: ILanguage;
  fortran: ILanguage;
  freemarker: ILanguage;
  fthtml: ILanguage;
  galen: ILanguage;
  gamemaker: ILanguage;
  gamemaker2: ILanguage;
  gamemaker81: ILanguage;
  gcode: ILanguage;
  gdscript: ILanguage;
  genstat: ILanguage;
  glsl: ILanguage;
  glyphs: ILanguage;
  gnuplot: ILanguage;
  gomod: ILanguage;
  gowork: ILanguage;
  grain: ILanguage;
  graphql: ILanguage;
  graphviz: ILanguage;
  groovy: ILanguage;
  haml: ILanguage;
  harbour: ILanguage;
  haskell: ILanguage;
  haxe: ILanguage;
  hcl: ILanguage;
  helm: ILanguage;
  hjson: ILanguage;
  homeassistant: ILanguage;
  hosts: ILanguage;
  http: ILanguage;
  hunspell: ILanguage;
  hy: ILanguage;
  hypr: ILanguage;
  icl: ILanguage;
  imba: ILanguage;
  informix: ILanguage;
  ink: ILanguage;
  innosetup: ILanguage;
  janet: ILanguage;
  jekyll: ILanguage;
  jenkins: ILanguage;
  jestsnapshot: ILanguage;
  jinja: ILanguage;
  jsonnet: ILanguage;
  json5: ILanguage;
  julia: ILanguage;
  io: ILanguage;
  iodine: ILanguage;
  k: ILanguage;
  kivy: ILanguage;
  kos: ILanguage;
  kotlin: ILanguage;
  kusto: ILanguage;
  latex: ILanguage;
  latino: ILanguage;
  lex: ILanguage;
  lilypond: ILanguage;
  lisp: ILanguage;
  literatehaskell: ILanguage;
  log: ILanguage;
  lolcode: ILanguage;
  lsl: ILanguage;
  m4: ILanguage;
  marko: ILanguage;
  matlab: ILanguage;
  maxscript: ILanguage;
  mdx: ILanguage;
  mediawiki: ILanguage;
  mel: ILanguage;
  mermaid: ILanguage;
  meson: ILanguage;
  mjml: ILanguage;
  mlang: ILanguage;
  mojo: ILanguage;
  mojolicious: ILanguage;
  mongo: ILanguage;
  mson: ILanguage;
  mv: ILanguage;
  mvt: ILanguage;
  mvtcss: ILanguage;
  mvtjs: ILanguage;
  nearley: ILanguage;
  nextflow: ILanguage;
  nginx: ILanguage;
  nim: ILanguage;
  nimble: ILanguage;
  nix: ILanguage;
  nsis: ILanguage;
  nunjucks: ILanguage;
  ocaml: ILanguage;
  ogone: ILanguage;
  openEdge: ILanguage;
  openHAB: ILanguage;
  org: ILanguage;
  pascal: ILanguage;
  pddl: ILanguage;
  pddlplan: ILanguage;
  pddlhappenings: ILanguage;
  pgsql: ILanguage;
  pine: ILanguage;
  pip: ILanguage;
  platformio: ILanguage;
  plsql: ILanguage;
  po: ILanguage;
  polymer: ILanguage;
  pony: ILanguage;
  postcss: ILanguage;
  prisma: ILanguage;
  processinglang: ILanguage;
  prolog: ILanguage;
  prometheus: ILanguage;
  protobuf: ILanguage;
  puppet: ILanguage;
  purescript: ILanguage;
  pyret: ILanguage;
  pyscript: ILanguage;
  pythowo: ILanguage;
  qlik: ILanguage;
  qml: ILanguage;
  qsharp: ILanguage;
  racket: ILanguage;
  raml: ILanguage;
  reason: ILanguage;
  red: ILanguage;
  rescript: ILanguage;
  restructuredtext: ILanguage;
  rexx: ILanguage;
  riot: ILanguage;
  rmd: ILanguage;
  rnc: ILanguage;
  robot: ILanguage;
  san: ILanguage;
  sas: ILanguage;
  sass: ILanguage;
  sbt: ILanguage;
  scad: ILanguage;
  scala: ILanguage;
  scilab: ILanguage;
  sdlang: ILanguage;
  searchresult: ILanguage;
  slang: ILanguage;
  s_lang: ILanguage;
  slice: ILanguage;
  slim: ILanguage;
  slint: ILanguage;
  sln: ILanguage;
  silverstripe: ILanguage;
  sino: ILanguage;
  skipper: ILanguage;
  smarty: ILanguage;
  snakemake: ILanguage;
  snippets: ILanguage;
  snort: ILanguage;
  solidity: ILanguage;
  sparql: ILanguage;
  springbootproperties: ILanguage;
  springbootpropertiesyaml: ILanguage;
  sqf: ILanguage;
  squirrel: ILanguage;
  stan: ILanguage;
  starlark: ILanguage;
  stata: ILanguage;
  stencil: ILanguage;
  stencilhtml: ILanguage;
  stylable: ILanguage;
  styled: ILanguage;
  stylus: ILanguage;
  svelte: ILanguage;
  svg: ILanguage;
  swagger: ILanguage;
  swig: ILanguage;
  systemd: ILanguage;
  systemverilog: ILanguage;
  t4: ILanguage;
  tailwindcss: ILanguage;
  teal: ILanguage;
  templ: ILanguage;
  templatetoolkit: ILanguage;
  tera: ILanguage;
  terraform: ILanguage;
  tex: ILanguage;
  textile: ILanguage;
  textmatejson: ILanguage;
  textmateyaml: ILanguage;
  tiltfile: ILanguage;
  toit: ILanguage;
  toml: ILanguage;
  ttcn: ILanguage;
  tuc: ILanguage;
  twig: ILanguage;
  typo3: ILanguage;
  uiua: ILanguage;
  unison: ILanguage;
  vba: ILanguage;
  vbscript: ILanguage;
  velocity: ILanguage;
  vento: ILanguage;
  verilog: ILanguage;
  vhdl: ILanguage;
  viml: ILanguage;
  vitestsnapshot: ILanguage;
  vlang: ILanguage;
  volt: ILanguage;
  vue: ILanguage;
  wai: ILanguage;
  wasm: ILanguage;
  wenyan: ILanguage;
  wgsl: ILanguage;
  wikitext: ILanguage;
  wolfram: ILanguage;
  wurst: ILanguage;
  wxml: ILanguage;
  xcompose: ILanguage;
  xmake: ILanguage;
  xquery: ILanguage;
  yacc: ILanguage;
  yang: ILanguage;
  zig: ILanguage;
  zip: ILanguage;
}
