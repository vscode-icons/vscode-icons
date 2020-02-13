export class Debugger {
  public static get isAttached(): boolean {
    return process.execArgv.some(arg => /^--(?:inspect|debug)/.test(arg));
  }
}
