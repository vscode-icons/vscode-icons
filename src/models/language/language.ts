export interface ILanguage {
  ids: string | string[];

  /**
   * Used by extension manifests not supporting language ids.
   * Today, only the Zed extension manifest uses this property.
   */
  knownExtensions?: string[];
  /**
   * Used by extension manifests not supporting language ids.
   * Today, only the Zed extension manifest uses this property.
   */
  knownFilenames?: string[];
}
