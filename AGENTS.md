# AGENTS.md - AI Agent Instructions for vscode-icons

## Project Overview

vscode-icons is a VS Code (and Zed editor) extension providing 1400+ file and
folder icons. The primary contribution type is adding new icons or extending
existing icon associations.

## Quick Reference

| Task                           | Files to Change                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| New file icon                  | `icons/file_type_{name}.svg` + `src/iconsManifest/supportedExtensions.ts`                                        |
| New folder icon                | `icons/folder_type_{name}.svg` + `icons/folder_type_{name}_opened.svg` + `src/iconsManifest/supportedFolders.ts` |
| New language ID                | `src/iconsManifest/languages.ts` + `src/iconsManifest/supportedExtensions.ts`                                    |
| Add extension to existing icon | `src/iconsManifest/supportedExtensions.ts` (modify existing entry)                                               |

## Tech Stack

- **Language**: TypeScript (ES6/CommonJS)
- **DI**: inversify
- **Tests**: Mocha + Chai + Sinon
- **Bundler**: Webpack
- **Formatting**: Prettier
- **JS/TS Linting**: ESLint
- **Markdown Linting**: remark
- **SVG Linting**: SVGLint
- **SVG Optimization**: SVGO
- **Node**: >= 22.18.0

## Setup & Verification

```bash
npm install            # Install dependencies
npm test               # Runs tests (compiles and validates all icon entries)
npm run check          # Perform format and linting (with fixes where applicable)
npm run compile:dev    # Compile TypeScript (development mode)
npm run build:dev      # Generate icon manifests package (development mode)
```

`npm run check` performs the following tasks:

```bash
npm run format         # Prettier fix
npm run lint           # ESLint fix
npm run lint:md        # remark fix
npm run lint:svgo      # SVGO optimization
npm run lint:svg       # SVGLint check
```

## Code Style

- Single quotes, trailing commas (always-multiline), arrow parens as-needed
- Max line length: 120 characters
- Interfaces use PascalCase without a prefix (e.g., `FileExtension`)
- Explicit member accessibility (public/private/protected)
- No `console.log` (use `console.info` or `console.error`)
- Pre-commit hooks enforce Prettier + ESLint + SVGLint via lint-staged

## Project Structure

```
icons/                              # SVG icon files (1700+ files)
src/
  iconsManifest/
    supportedExtensions.ts          # File icon definitions (main config)
    supportedFolders.ts             # Folder icon definitions
    languages.ts                    # Language ID mappings
    manifestBuilder.ts              # Builds VSCode + Zed + API manifests
    iconsGenerator.ts               # Orchestrates manifest generation
    customsMerger.ts                # Merges user customizations
  types/
    vsicons.ts                      # FileExtension, FolderExtension, Language interfaces
    enums.ts                        # FileFormat enum (svg, png)
test/                               # Test files (mirrors src/)
  iconsManifest/
    specsExtensions.test.ts         # Validates all file icon entries
    specsFolders.test.ts            # Validates all folder icon entries
```

### Key File Landmarks

- **`src/iconsManifest/supportedExtensions.ts`**: The `supported` array starts
  at **line 8**. Entries are alphabetically ordered by `icon` name (first entry:
  `access`, last: `zsh`). New entries must be inserted in alphabetical order
  within this array.
- **`src/iconsManifest/supportedFolders.ts`**: The `supported` array starts at
  **line 8**. Entries are alphabetically ordered by `icon` name (first:
  `android`, last: `zed`).
- **`src/iconsManifest/languages.ts`**: The languages object starts at **line
  3**. Entries are alphabetically ordered by key (first: `actionscript`, last:
  `zip`).

## Adding a File Icon

1. Create SVG icon at `icons/file_type_{name}.svg`

2. Add entry to `src/iconsManifest/supportedExtensions.ts` in **alphabetical
   order**:

   ```typescript
   // By filename (e.g., config files):
   { icon: 'name', extensions: ['.configrc'], filename: true },

   // By file extension (NO leading dot):
   { icon: 'name', extensions: ['ext1', 'ext2'] },

   // By language ID:
   { icon: 'name', languages: [languages.langName] },

   // With filename glob combinations:
   {
     icon: 'name',
     extensions: ['.babelrc'],
     filenamesGlob: ['.babelrc', 'babel.config'],
     extensionsGlob: ['js', 'cjs', 'mjs', 'json'],
     filename: true,
   },
   ```

3. If using language IDs, add to `src/iconsManifest/languages.ts`:

   ```typescript
   langName: { ids: 'vscode-language-id', knownExtensions: ['ext'] },
   ```

4. Optional: Create `icons/file_type_light_{name}.svg` if setting `light: true`

5. Run `npm test` to validate.

## Adding a Folder Icon

1. Create TWO SVG icons:
   - `icons/folder_type_{name}.svg` (collapsed)
   - `icons/folder_type_{name}_opened.svg` (expanded)

2. Add entry to `src/iconsManifest/supportedFolders.ts` in **alphabetical
   order**:

   ```typescript
   { icon: 'name', extensions: ['foldername', '.foldername'] },
   ```

3. Optional: Create light variants `folder_type_light_{name}.svg` +
   `folder_type_light_{name}_opened.svg`

4. Run `npm test` to validate.

## Adding a Language Association

In `src/iconsManifest/languages.ts`:

```typescript
langName: { ids: 'vscode-language-id', knownExtensions: ['ext'] },
```

or

```typescript
langName: { ids: ['vscode-language-id'], knownExtensions: ['ext'] },
```

- `ids`: VS Code language ID (string or string\[])
- `knownExtensions`: File extensions for Zed editor support
- `knownFilenames`: Specific filenames for Zed editor support

Then reference it in `supportedExtensions.ts` via the `languages` property.

## Common Mistakes to Avoid

- Adding a leading dot to file extensions when `filename` is not `true`
- Forgetting the `_opened.svg` variant for folder icons
- Not placing the entry in alphabetical order
- Creating duplicate icon entries
- Empty `extensions` array
- Non-present `extensions` array without `languages` or glob alternatives
- Forgetting light theme SVG when setting `light: true`

## Key Interfaces

```typescript
interface FileExtension {
  icon: string; // Maps to file_type_{icon}.svg
  extensions?: string[]; // File extensions or filenames
  format?: FileFormat | string; // Default is FileFormat.svg or 'svg'
  filename?: boolean; // true = extensions are full filenames
  languages?: Language[]; // VS Code language associations
  light?: boolean; // Requires file_type_light_{icon}.svg
  disabled?: boolean; // Hidden by default
  filenamesGlob?: string[]; // Glob filename patterns
  extensionsGlob?: string[]; // Glob extension patterns
}

interface FolderExtension {
  icon: string; // Maps to folder_type_{icon}.svg
  extensions?: string[]; // Folder names to match
  format?: FileFormat | string; // Default is FileFormat.svg or 'svg'
  light?: boolean; // Requires light theme variants
  disabled?: boolean; // Hidden by default
}

interface Language {
  ids: string | string[]; // VS Code language ID(s)
  knownExtensions?: string[]; // For Zed editor
  knownFilenames?: string[]; // For Zed editor
}
```

## Test Validation

Tests automatically validate:

- Every icon entry has a corresponding SVG file in `icons/`
- No duplicate declarations
- No leading dots on non-filename extensions
- Folder icons have both closed and opened variants
- Light theme entries have corresponding light SVG files
- No empty `extensions`, `languages`, `filenamesGlob` or `extensionsGlob` arrays
  (omit the property instead)
- Entries without `extensions` provide `languages` or glob alternatives

**Always run `npm test` before submitting changes.**

## SVG Icon Optimization & Linting

```bash
npm run optimize-icon ./icons/<filename>.svg
```

```bash
npm run lint:svg ./icons/<filename>.svg
```

## Commit Convention

Use conventional commits with scope:

```
feat(icon): add support for parcel
feat(folder): add cargo folder icon
fix(icon): correct extension for typescript
chore(version): bump to 12.17.0
```

## PR Convention

- Reference the issue: `Fixes #IssueNumber`
- PR title: short description with conventional commit prefix
- Icon SVGs should be optimized (use SVGO if possible)
- The CI will automatically generate icon preview images for SVG changes
