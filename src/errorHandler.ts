export class ErrorHandler {
  public static LogError(error: Error, handled = false): void {
    console.error(`${handled ? 'H' : 'Unh'}andled Error: ${error.stack || error.message || error}`);
  }
}
