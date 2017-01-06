import { ISchemaSettings } from './schemaSettings';
import { IIconPath } from './iconPath';

export interface IIconSchema extends ISchemaSettings {
  iconDefinitions: {
    _file: IIconPath;
    _folder: IIconPath;
    _folder_open: IIconPath;
    _file_light: IIconPath;
    _folder_light: IIconPath;
    _folder_light_open: IIconPath;
    [iconDefinition: string]: IIconPath;
  };
  light: ISchemaSettings;
}
