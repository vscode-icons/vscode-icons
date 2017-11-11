import { IIconMapping } from './iconMapping';
import { IIconDefinition } from './iconDefinition';

export interface IIconSchema extends IIconMapping {
  iconDefinitions: IIconDefinition;
  light: IIconMapping;
  highContrast?: IIconMapping;
  hidesExplorerArrows?: boolean;
}
