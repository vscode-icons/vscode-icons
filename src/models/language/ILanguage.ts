export interface ILanguage {
  ids: string | string[];
  defaultExtension: string; // this is only used for exampleGenerator, so it can know which extension to use.
}
