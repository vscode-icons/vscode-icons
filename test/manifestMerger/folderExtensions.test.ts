// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { extensions as fileExtensions } from '../support/supportedExtensions';
import { extensions as folderExtensions } from '../support/supportedFolders';
import { extensionSettings } from '../../src/settings';
import { IconGenerator, mergeConfig, schema } from '../../src/icon-manifest';
import * as utils from '../../src/utils';

describe('FolderExtensions: merging configuration documents', function() {
  const tempFolderPath = utils.tempPath();
  const customIconFolderPath = 'some/custom/icons/folder/path';
  const customIconFolderPathFull = utils.pathUnixJoin(
    customIconFolderPath,
    extensionSettings.customIconFolderName,
  );

  before(() => {
    // ensure the tests write to the temp folder
    process.chdir(tempFolderPath);
    utils.createDirectoryRecursively(extensionSettings.customIconFolderName);
    utils.createDirectoryRecursively(customIconFolderPathFull);
  });

  after(() => {
    utils.deleteDirectoryRecursively(extensionSettings.customIconFolderName);
    utils.deleteDirectoryRecursively(customIconFolderPathFull);
  });

  let iconGenerator: IconGenerator;

  beforeEach(() => {
    iconGenerator = new IconGenerator(utils.vscode, schema);
    iconGenerator.settings.vscodeAppUserPath = tempFolderPath;
  });

  afterEach(() => {
    iconGenerator = null;
  });

  context('ensures that', function() {
    it('new extensions are added to existing file extension and respect the extension type', function() {
      const custom: any = {
        default: null,
        supported: [{ icon: 'aws', extensions: ['aws3'], format: 'svg' }],
      };

      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const def = json.iconDefinitions['_fd_aws'];
      expect(def).exist;
      expect(def.iconPath).exist;
      expect(json.folderNames['aws3']).to.equal('_fd_aws');
      expect(json.folderNamesExpanded['aws3']).to.equal('_fd_aws_open');
      expect(path.extname(def.iconPath)).to.equal('.svg');
    });

    it('overrides removes the specified extension', function() {
      const custom: any = {
        default: null,
        supported: [
          {
            icon: 'aws2',
            extensions: ['aws2'],
            overrides: 'aws',
            format: 'svg',
          },
        ],
      };

      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const overridenPath = json.iconDefinitions['_fd_aws'];
      const newPath = json.iconDefinitions['_fd_aws2'].iconPath;
      expect(overridenPath).to.not.exist;
      expect(newPath).exist;
    });

    it('extends replaces the extension', function() {
      const custom: any = {
        default: null,
        supported: [
          {
            icon: 'newExt',
            extensions: ['mynew'],
            extends: 'aws',
            format: 'png',
          },
        ],
      };

      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const extendedPath = json.iconDefinitions['_fd_aws'];
      const newPath = json.iconDefinitions['_fd_newExt'].iconPath;
      expect(extendedPath).not.to.exist;
      expect(newPath).exist;
      expect(json.folderNames['aws']).to.equal('_fd_newExt');
      expect(json.folderNamesExpanded['aws']).to.equal('_fd_newExt_open');
      expect(json.folderNames['mynew']).to.equal('_fd_newExt');
      expect(json.folderNamesExpanded['mynew']).to.equal('_fd_newExt_open');
      expect(path.extname(newPath)).not.to.equal('.svg');
    });

    it('disabled extensions are not included into the manifest', function() {
      const custom: any = {
        default: null,
        supported: [
          { icon: 'aws', extensions: [], disabled: true, format: 'svg' },
        ],
      };
      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const def = json.iconDefinitions['_fd_aws'];
      expect(def).not.to.exist;
      expect(json.iconDefinitions['_fd_newExt']).not.to.exist;
    });

    it('not disabled extensions are included into the manifest', function() {
      const custom: any = {
        default: null,
        supported: [
          { icon: 'aws', extensions: [], disabled: false, format: 'svg' },
        ],
      };
      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const def = json.iconDefinitions['_fd_aws'];
      expect(def).to.exist;
      expect(json.iconDefinitions['_fd_newExt']).not.to.exist;
    });

    it('if extensions is not defined, it gets added internally', function() {
      const custom: any = {
        default: null,
        supported: [{ icon: 'aws', disabled: false, format: 'svg' }],
      };
      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      const def = json.iconDefinitions['_fd_aws'];
      expect(def).to.exist;
      expect(json.iconDefinitions['_fd_newExt']).not.to.exist;
    });

    it('existing extensions are removed from the original extension', function() {
      const custom: any = {
        default: null,
        supported: [{ icon: 'newExt', extensions: ['aws'], format: 'svg' }],
      };
      const json = mergeConfig(
        null,
        fileExtensions,
        custom,
        folderExtensions,
        iconGenerator,
      );
      expect(json.iconDefinitions['_fd_newExt']).exist;
      expect(json.folderNames['aws']).to.equal('_fd_newExt');
    });

    context('custom icon', function() {
      it('keeps the correct extension', function() {
        const custom: any = {
          default: null,
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };
        const json = mergeConfig(
          null,
          fileExtensions,
          custom,
          folderExtensions,
          iconGenerator,
        );
        const customDef = json.iconDefinitions['_fd_custom_icon'];
        expect(customDef).exist;
        expect(path.extname(customDef.iconPath)).to.equal('.svg');
      });

      it('has a custom path', function() {
        const custom: any = {
          default: null,
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };
        const iconName =
          `${extensionSettings.folderPrefix}${custom.supported[0].icon}` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNameOpen =
          `${extensionSettings.folderPrefix}${
            custom.supported[0].icon
          }_opened` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNamePath = path.join(
          extensionSettings.customIconFolderName,
          iconName,
        );
        const iconNameOpenPath = path.join(
          extensionSettings.customIconFolderName,
          iconNameOpen,
        );

        try {
          fs.writeFileSync(iconNamePath, '');
          fs.writeFileSync(iconNameOpenPath, '');

          const json = mergeConfig(
            null,
            fileExtensions,
            custom,
            folderExtensions,
            iconGenerator,
          );
          const customDef = json.iconDefinitions['_fd_custom_icon'];
          expect(customDef).exist;
          expect(customDef.iconPath).contains(
            extensionSettings.customIconFolderName,
          );
          expect(json.folderNames['custom']).to.equal('_fd_custom_icon');
          expect(json.folderNamesExpanded['custom']).to.equal(
            '_fd_custom_icon_open',
          );
        } finally {
          fs.unlinkSync(iconNamePath);
          fs.unlinkSync(iconNameOpenPath);
        }
      });
    });

    context('the manifest generator', function() {
      it('uses the custom icon folder path, when provided', function() {
        const custom: any = {
          default: null,
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };

        iconGenerator = new IconGenerator(
          utils.vscode,
          schema,
          customIconFolderPath,
        );
        iconGenerator.settings.vscodeAppUserPath = tempFolderPath;

        const iconName =
          `${extensionSettings.folderPrefix}${custom.supported[0].icon}` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNameOpen =
          `${extensionSettings.folderPrefix}${
            custom.supported[0].icon
          }_opened` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNamePath = path.join(customIconFolderPathFull, iconName);
        const iconNameOpenPath = path.join(
          customIconFolderPathFull,
          iconNameOpen,
        );

        try {
          fs.writeFileSync(iconNamePath, '');
          fs.writeFileSync(iconNameOpenPath, '');

          const json = mergeConfig(
            null,
            fileExtensions,
            custom,
            folderExtensions,
            iconGenerator,
          );
          const customDef = json.iconDefinitions['_fd_custom_icon'];
          expect(customDef).exist;
          expect(customDef.iconPath).to.contain(customIconFolderPathFull);
          expect(json.folderNames['custom']).to.equal('_fd_custom_icon');
          expect(json.folderNamesExpanded['custom']).to.equal(
            '_fd_custom_icon_open',
          );
        } finally {
          fs.unlinkSync(iconNamePath);
          fs.unlinkSync(iconNameOpenPath);
        }
      });

      it('avoids custom icons detection', function() {
        const custom: any = {
          default: null,
          supported: [
            {
              icon: 'custom_icon',
              extensions: ['custom'],
              format: 'svg',
            },
          ],
        };

        iconGenerator = new IconGenerator(
          utils.vscode,
          schema,
          customIconFolderPath,
          /*avoidCustomDetection*/ true,
        );
        iconGenerator.settings.vscodeAppUserPath = tempFolderPath;

        const iconName =
          `${extensionSettings.folderPrefix}${custom.supported[0].icon}` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNameOpen =
          `${extensionSettings.folderPrefix}${
            custom.supported[0].icon
          }_opened` +
          `${extensionSettings.iconSuffix}.${custom.supported[0].format}`;
        const iconNamePath = path.join(customIconFolderPathFull, iconName);
        const iconNameOpenPath = path.join(
          customIconFolderPathFull,
          iconNameOpen,
        );

        try {
          fs.writeFileSync(iconNamePath, '');
          fs.writeFileSync(iconNameOpenPath, '');

          const json = mergeConfig(
            null,
            fileExtensions,
            custom,
            folderExtensions,
            iconGenerator,
          );
          const customDef = json.iconDefinitions['_fd_custom_icon'];
          expect(customDef).exist;
          expect(
            customDef.iconPath.startsWith(iconGenerator.iconsFolderBasePath),
          ).to.be.true;
          expect(json.folderNames['custom']).to.equal('_fd_custom_icon');
          expect(json.folderNamesExpanded['custom']).to.equal(
            '_fd_custom_icon_open',
          );
        } finally {
          fs.unlinkSync(iconNamePath);
          fs.unlinkSync(iconNameOpenPath);
        }
      });
    });
  });
});
