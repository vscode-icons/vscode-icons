import { IVSCodeProperties } from './vscodeProperties';

export interface IVSCodeConfiguration {
  title: string;
  properties: Record<string, IVSCodeProperties>;
}
