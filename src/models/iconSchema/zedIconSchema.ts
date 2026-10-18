import type { IZedTheme } from './zedTheme';

export interface IZedIconSchema extends Record<string, unknown> {
  themes: IZedTheme[];
}
