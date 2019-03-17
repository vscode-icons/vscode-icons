import { FileFormat, IFileCollection } from '../../src/models';

export const extensions: IFileCollection = {
  default: {
    file: { icon: 'file', format: FileFormat.svg },
  },
  supported: [
    { icon: 'actionscript', extensions: ['as'], format: FileFormat.svg },
    { icon: 'aspx', extensions: ['aspx', 'ascx'], format: FileFormat.svg },
   ],
};
