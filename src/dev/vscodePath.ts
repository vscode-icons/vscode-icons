import * as os from 'os';

export function vscodePath () {
  let appPath = process.env.APPDATA;
  if (!appPath) {
    if (process.platform === 'darwin') {
      appPath = process.env.HOME + '/Library/Application Support';
    } else if (process.platform === 'linux') {
      appPath = os.homedir() + '/.config';
    } else {
      appPath = '/var/local';
    }
  }
  return appPath;
};
