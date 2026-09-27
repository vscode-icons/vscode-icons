import js from '@eslint/js';
import { importX } from 'eslint-plugin-import-x';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import { join } from 'node:path';
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
      'no-duplicate-imports': 'error',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-invalid-this': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
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
    ignores: ['webpack.config.ts'],
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
      '@typescript-eslint/no-empty-function': 'error',
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
    files: ['**/*.test.ts'],
    rules: {
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
);
