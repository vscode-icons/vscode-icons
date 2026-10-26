import { join } from 'node:path';

import js from '@eslint/js';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

export default defineConfig(
  includeIgnoreFile(join(import.meta.dirname, '.gitignore')),
  js.configs.recommended,
  importX.flatConfigs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    rules: {
      'arrow-body-style': 'error',
      curly: 'error',
      'dot-notation': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'id-blacklist': ['error', 'any', 'number', 'string', 'boolean'],
      'id-match': 'error',
      'max-classes-per-file': ['error', 1],
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': [
        'error',
        {
          allow: ['info', 'error'],
        },
      ],
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-invalid-this': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "VariableDeclarator[init.type='ArrowFunctionExpression']:is([parent.parent.type='Program'], [parent.parent.type='ExportNamedDeclaration']), ExportDefaultDeclaration > ArrowFunctionExpression",
          message: 'Use a function declaration for top-level functions.',
        },
      ],
      'no-return-await': 'error',
      'no-sequences': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': [
        'error',
        {
          allow: [
            '_watch',
            '_default',
            '_file',
            '_file_light',
            '_folder',
            '_folder_open',
            '_folder_light',
            '_folder_light_open',
            '_root_folder',
            '_root_folder_open',
            '_root_folder_light',
            '_root_folder_light_open',
          ],
        },
      ],
      'no-unused-expressions': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'prefer-arrow-callback': 'error',
      'prefer-object-spread': 'error',
      'quote-props': ['error', 'as-needed'],
      radix: 'error',
      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['#region', '#endregion'],
        },
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          groups: [
            'type',
            'builtin',
            'external',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          sortTypesGroup: true,
        },
      ],
      'import-x/namespace': 'off',
      'import-x/no-unresolved': [
        'error',
        {
          ignore: ['vscode', '\\.json$'],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': false,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['private-constructors'] },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/parameter-properties': [
        'error',
        {
          allow: ['private'],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: false,
          allowIIFEs: false,
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  {
    files: ['src/iconsManifest/*.ts'],
    plugins: { perfectionist },
    settings: {
      perfectionist: {
        // Plain code point order, so `al` < `al_dal` and `c3` < `c_al`.
        type: 'custom',
        alphabet: String.fromCharCode(
          ...Array.from({ length: 95 }, (_, i) => i + 32),
        ),
        ignoreCase: false,
      },
    },
  },
  {
    files: [
      'src/iconsManifest/supportedExtensions.ts',
      'src/iconsManifest/supportedFolders.ts',
    ],
    rules: {
      // Entries start with `icon`, so sorting by element text sorts by icon name.
      'perfectionist/sort-arrays': [
        'error',
        {
          useConfigurationIf: {
            matchesAstSelector:
              'Property[key.name="supported"] > ArrayExpression',
          },
        },
      ],
    },
  },
  {
    files: ['src/iconsManifest/languages.ts'],
    rules: {
      'perfectionist/sort-objects': [
        'error',
        {
          useConfigurationIf: {
            matchesAstSelector:
              'VariableDeclarator[id.name="languages"] > ObjectExpression',
          },
        },
      ],
    },
  },
  {
    files: ['src/**/index.ts'],
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-exports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
        },
      ],
    },
  },
);
