import type { IIconDefinition } from './iconDefinition';
import type { IIconMapping } from './iconMapping';

export interface IIconSchema extends IIconMapping {
  iconDefinitions: IIconDefinition;
  light: IIconMapping;
  highContrast?: IIconMapping;
  hidesExplorerArrows?: boolean;
}
