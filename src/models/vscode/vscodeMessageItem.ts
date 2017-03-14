export interface IVSCodeMessageItem {
  /**
   * A short title like 'Retry', 'Open Log' etc.
   */
  title: string;

  /**
   * Indicates that this item replaces the default
   * 'Close' action.
   */
  isCloseAffordance?: boolean;
}
