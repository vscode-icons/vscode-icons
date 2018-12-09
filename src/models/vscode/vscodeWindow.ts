export interface IVSCodeWindow {
  showInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
}
