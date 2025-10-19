import { IIconDefinition } from './iconDefinition';
import { IIconMapping } from './iconMapping';

export interface IIconSchema extends IIconMapping {
  iconDefinitions: IIconDefinition;
  light: IIconMapping;
  highContrast?: IIconMapping;
  hidesExplorerArrows?: boolean;
}
