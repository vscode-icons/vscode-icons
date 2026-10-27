import type { NodeArray, VariableDeclaration } from 'typescript';

import type { IconManifest } from '../types';

import { createGenerator } from 'ts-json-schema-generator';
import {
  ScriptTarget,
  createSourceFile,
  isIdentifier,
  isTypeReferenceNode,
  isVariableStatement,
  sys,
} from 'typescript';

import { ErrorHandler } from '../common/errorHandler';
import { writeFileAsync } from '../common/fsAsync';
import { ConfigManager } from '../configuration/configManager';
import { constants } from '../constants';
import { IconsGenerator } from '../iconsManifest/iconsGenerator';
import { Utils } from '../utils';

function getApiSchemaTypeName(): string {
  const sourceFilePath = Utils.pathUnixJoin(
    ConfigManager.rootDir,
    constants.schemas.apiSourceFile,
  );
  const sourceText = sys.readFile(sourceFilePath);
  if (!sourceText) {
    throw new Error(`Unable to read API schema type from '${sourceFilePath}'`);
  }

  const sourceFile = createSourceFile(
    sourceFilePath,
    sourceText,
    ScriptTarget.Latest,
    true,
  );
  const apiSchemaDeclaration = sourceFile.statements
    .filter(isVariableStatement)
    .flatMap(
      (statement): NodeArray<VariableDeclaration> =>
        statement.declarationList.declarations,
    )
    .find(
      (declaration): boolean =>
        isIdentifier(declaration.name) && declaration.name.text === 'apiSchema',
    );
  const apiSchemaType = apiSchemaDeclaration?.type;

  if (!apiSchemaType || !isTypeReferenceNode(apiSchemaType)) {
    throw new Error(`Unable to find the API schema type annotation`);
  }

  return apiSchemaType.typeName.getText(sourceFile);
}

async function generateApiJsonSchema(): Promise<void> {
  const type = getApiSchemaTypeName();
  const generatedSchema = createGenerator({
    path: Utils.pathUnixJoin(
      ConfigManager.rootDir,
      constants.schemas.apiSourceFile,
    ),
    topRef: false,
    tsconfig: Utils.pathUnixJoin(ConfigManager.rootDir, 'tsconfig.json'),
    type,
  }).createSchema(type);
  const { $schema, ...schemaContent } = generatedSchema;
  const schema = { $schema, title: type, ...schemaContent };

  await writeFileAsync(
    Utils.pathUnixJoin(ConfigManager.rootDir, constants.schemas.apiSchemaFile),
    JSON.stringify(schema, null, 2),
  );
}

async function build(argv: string[]): Promise<void> {
  try {
    constants.environment.production = argv.some((arg: string): boolean =>
      /release|production/.test(arg),
    );
    const iconsGenerator = new IconsGenerator();
    const iconsManifest: IconManifest =
      await iconsGenerator.generateIconsManifest();
    await iconsGenerator.persist(
      iconsManifest,
      constants.environment.production,
    );
    if (!constants.environment.production) {
      await generateApiJsonSchema();
    }
  } catch (error: unknown) {
    ErrorHandler.logError(error);
    process.exitCode = 1;
  }
}

void build(process.argv);
