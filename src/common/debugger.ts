export class Debugger {
  public static get isAttached(): boolean {
    return process.execArgv.some((arg: string): boolean =>
      /^--(?:inspect|debug)/.test(arg),
    );
  }
}
