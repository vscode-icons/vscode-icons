export class Debugger {
  public static get isAttached() {
    return process.execArgv.some(arg => /^--(?:inspect|debug)/.test(arg));
  }
}
