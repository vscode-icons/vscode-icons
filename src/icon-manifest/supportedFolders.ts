/* tslint:disable max-line-length */
import { FileFormat, IFolderCollection } from '../models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', format: FileFormat.svg },
    root_folder: { icon: 'root_folder', format: FileFormat.svg },
  },
  supported: [
    { icon: 'aurelia', extensions: ['aurelia_project'], format: FileFormat.svg },
    { icon: 'aws', extensions: ['aws', '.aws'], format: FileFormat.svg },
    { icon: 'binary', extensions: ['bin', '.bin'], format: FileFormat.svg },
    { icon: 'bower', extensions: ['bower_components'], format: FileFormat.svg },
    { icon: 'cake', extensions: ['cake', '.cake'], format: FileFormat.svg },
    { icon: 'chef', extensions: ['chef', '.chef'], format: FileFormat.svg },
    { icon: 'circleci', extensions: ['.circleci'], format: FileFormat.svg },
    { icon: 'composer', extensions: ['composer', '.composer'], format: FileFormat.svg },
    { icon: 'client', extensions: ['client'], format: FileFormat.svg },
    { icon: 'config', extensions: ['config', '.config', 'ini', '.ini', 'initializers', '.initializers'], format: FileFormat.svg },
    { icon: 'css', extensions: ['css', '_css'], format: FileFormat.svg },
    { icon: 'debian', extensions: ['debian'], format: FileFormat.svg },
    { icon: 'dist', extensions: ['dist', 'out', 'export', 'build', 'release'], format: FileFormat.svg },
    { icon: 'docker', extensions: ['docker', '.docker'], format: FileFormat.svg },
    { icon: 'docs', extensions: ['docs', 'doc'], format: FileFormat.svg },
    { icon: 'elasticbeanstalk', extensions: ['.elasticbeanstalk', '.ebextensions'], format: FileFormat.svg },
    { icon: 'flow', extensions: ['flow'], format: FileFormat.svg },
    { icon: 'fonts', extensions: ['fonts', 'font', 'fnt'], light: true, format: FileFormat.svg },
    { icon: 'git', extensions: ['.git', 'submodules', '.submodules'], format: FileFormat.svg },
    { icon: 'github', extensions: ['.github'], format: FileFormat.svg },
    { icon: 'gitlab', extensions: ['.gitlab'], format: FileFormat.svg },
    { icon: 'gcp', extensions: ['gcp', '.gcp'], format: FileFormat.svg },
    { icon: 'haxelib', extensions: ['haxelib'], format: FileFormat.svg },
    { icon: 'js', extensions: ['js'], format: FileFormat.svg },
    { icon: 'kubernetes', extensions: ['kubernetes', 'k8s', 'kube', 'kuber'], format: FileFormat.svg },
    { icon: 'idea', extensions: ['.idea'], format: FileFormat.svg },
    { icon: 'images', extensions: ['images', 'image', 'img', 'icons', 'icon', 'ico'], format: FileFormat.svg },
    { icon: 'include', extensions: ['include', 'includes', 'incl'], format: FileFormat.svg },
    { icon: 'less', extensions: ['less', '_less'], format: FileFormat.svg },
    { icon: 'library', extensions: ['lib', '.lib'], format: FileFormat.svg },
    { icon: 'locale', extensions: ['locale', 'locales', 'i18n', 'g11n'], format: FileFormat.svg },
    { icon: 'log', extensions: ['log', 'logs'], format: FileFormat.svg },
    { icon: 'mjml', extensions: ['mjml', '.mjml'], format: FileFormat.svg },
    { icon: 'mongodb', extensions: ['mongodb'], format: FileFormat.svg },
    { icon: 'node', extensions: ['node_modules'], light: true, format: FileFormat.svg },
    { icon: 'nuget', extensions: ['.nuget'], format: FileFormat.svg },
    { icon: 'package', extensions: ['package', 'packages', '.package', '.packages'], format: FileFormat.svg },
    { icon: 'paket', extensions: ['.paket'], format: FileFormat.svg },
    { icon: 'php', extensions: ['php'], format: FileFormat.svg },
    { icon: 'plugin', extensions: ['plugin', '.plugin', 'plugins', '.plugins'], format: FileFormat.svg },
    { icon: 'private', extensions: ['private', '.private'], format: FileFormat.svg },
    { icon: 'public', extensions: ['public', '.public'], format: FileFormat.svg },
    { icon: 'redis', extensions: ['redis'], format: FileFormat.svg },
    { icon: 'ravendb', extensions: ['ravendb'], format: FileFormat.svg },
    { icon: 'meteor', extensions: ['.meteor'], light: true, format: FileFormat.svg },
    { icon: 'sass', extensions: ['sass', 'scss', '_sass', '_scss'], light: true, format: FileFormat.svg },
    { icon: 'script', extensions: ['script', 'scripts'], format: FileFormat.svg },
    { icon: 'src', extensions: ['src', 'source', 'sources'], format: FileFormat.svg },
    { icon: 'server', extensions: ['server'], format: FileFormat.svg },
    { icon: 'style', extensions: ['style', 'styles'], format: FileFormat.svg },
    {
      icon: 'test', extensions: [
        'tests',
        '.tests',
        'test',
        '.test',
        '__tests__',
        '__test__',
        'spec',
        '.spec',
        'specs',
        '.specs'],
      format: FileFormat.svg,
    },
    { icon: 'tools', extensions: ['tools', '.tools'], format: FileFormat.svg },
    { icon: 'typescript', extensions: ['typescript', 'ts'], format: FileFormat.svg },
    { icon: 'typings', extensions: ['typings'], format: FileFormat.svg },
    { icon: 'typings2', extensions: ['typings'], format: FileFormat.svg, disabled: true },
    { icon: 'vagrant', extensions: ['vagrant', '.vagrant'], format: FileFormat.svg },
    { icon: 'view', extensions: ['html', 'view', 'views'], format: FileFormat.svg },
    { icon: 'vs', extensions: ['.vs'], format: FileFormat.svg },
    { icon: 'vscode', extensions: ['.vscode'], format: FileFormat.svg },
    { icon: 'vscode_test', extensions: ['.vscode-test'], format: FileFormat.svg },
    { icon: 'webpack', extensions: ['webpack'], format: FileFormat.svg },
    { icon: 'www', extensions: ['www', 'wwwroot'], format: FileFormat.svg },
  ],
};
