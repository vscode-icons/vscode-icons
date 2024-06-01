export class ErrorHandler {
  public static logError(error: unknown, handled = false): void {
    if (!error) {
      return;
    }
    const msg: string =
      error instanceof Error
        ? error.stack ?? (error.message || error.toString())
        : (error as string);
    console.error(`${handled ? 'H' : 'Unh'}andled Error: ${msg}`);
  }
}
