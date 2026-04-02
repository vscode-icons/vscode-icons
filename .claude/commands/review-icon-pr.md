Review an icon contribution PR for vscode-icons.

The user will provide a PR number or URL.

## Steps:

1. **Fetch PR details**: Use `gh pr view` and `gh pr diff` to understand the changes.

2. **Check icon naming**: Verify SVG files follow naming convention:
   - File icons: `file_type_{name}.svg`
   - Folder icons: `folder_type_{name}.svg` + `folder_type_{name}_opened.svg`
   - Light variants: `file_type_light_{name}.svg` or `folder_type_light_{name}.svg`

3. **Check config entry**: Verify the entry in `supportedExtensions.ts` or `supportedFolders.ts`:
   - Is it in alphabetical order?
   - Does the `icon` value match the SVG filename?
   - Are extensions formatted correctly (no leading dot for non-filename entries)?
   - Is `format: FileFormat.svg` present?
   - If `light: true`, does the light SVG exist?
   - If folder, does the `_opened.svg` variant exist?

4. **Check for common issues**:
   - Duplicate entries
   - Empty extensions without alternatives (languages/globs)
   - ESLint/Prettier violations (single quotes, trailing commas, 120 char max)
   - Oversized SVGs (should be optimized)

5. **Check language entry** (if applicable): Verify `languages.ts` entry has correct VS Code language IDs.

6. **Report findings**: Summarize what's correct and what needs fixing.

PR: $ARGUMENTS
