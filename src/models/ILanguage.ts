export interface ILanguage {
  ids: string | string[];
  defaultExtension: string;
}

export interface ILanguageCollection {
  bat: ILanguage;
  c: ILanguage;
  clojure: ILanguage;
  coffeescript: ILanguage;
  cpp: ILanguage;
  crystal: ILanguage;
  csharp: ILanguage;
  css: ILanguage;
  fsharp: ILanguage;
  diff: ILanguage;
  dockerfile: ILanguage;
  git: ILanguage;
  go: ILanguage;
  groovy: ILanguage;
  handlebars: ILanguage;
  html: ILanguage;
  ini: ILanguage;
  java: ILanguage;
  javascript: ILanguage;
  javascriptreact: ILanguage;
  json: ILanguage;
  less: ILanguage;
  lua: ILanguage;
  makefile: ILanguage;
  markdown: ILanguage;
  objectivec: ILanguage;
  perl: ILanguage;
  php: ILanguage;
  plaintext: ILanguage;
  polymer: ILanguage;
  postcss: ILanguage;
  powershell: ILanguage;
  prolog: ILanguage;
  properties: ILanguage;
  pug: ILanguage;
  python: ILanguage;
  r: ILanguage;
  razor: ILanguage;
  restructuredtext: ILanguage;
  ruby: ILanguage;
  rust: ILanguage;
  scss: ILanguage;
  shaderlab: ILanguage;
  shellscript: ILanguage;
  sql: ILanguage;
  swift: ILanguage;
  typescript: ILanguage;
  vb: ILanguage;
  xml: ILanguage;
  xsl: ILanguage;
  yaml: ILanguage;
}
