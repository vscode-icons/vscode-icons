import { IIconMapping } from './iconMapping';
import { IIconDefinition } from './iconDefinition';

export interface IIconSchema extends IIconMapping {
  hidesExplorerArrows?: boolean;
  iconDefinitions: IIconDefinition;
  light: IIconMapping;
  highContrast?: IIconMapping;
}
