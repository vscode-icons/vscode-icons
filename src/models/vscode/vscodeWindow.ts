export interface IVSCodeWindow {
  showInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  showWarningMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  showErrorMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
}
