import { IconsGenerator } from './iconsManifest/iconsGenerator';
import { IIconsGenerator } from './models';

const iconsGenerator: IIconsGenerator = new IconsGenerator();
const iconsManifest = iconsGenerator.generateIconsManifest();
iconsGenerator.persist(iconsManifest, /*updatePackageJson*/ true);
