Validate an icon entry in vscode-icons.

The user will provide an icon name to check.

## Steps:

1. **Find the config entry**: Search for the icon name in `src/iconsManifest/supportedExtensions.ts` and `src/iconsManifest/supportedFolders.ts`.

2. **Verify SVG files exist**:
   - File icon: `icons/file_type_{icon}.svg` must exist
   - Folder icon: `icons/folder_type_{icon}.svg` AND `icons/folder_type_{icon}_opened.svg` must exist
   - If `light: true`: light variant SVGs must also exist

3. **Check config entry**:
   - Is it in alphabetical order relative to neighbors?
   - Does the `icon` value match the SVG filename?
   - Are extensions formatted correctly (no leading dot for non-filename entries)?
   - Is `format: FileFormat.svg` present?
   - If `extensions` is empty, are `languages` or glob alternatives provided?

4. **Check for duplicates**: Verify no other entry shares the same extensions or icon name.

5. **Run tests**: Execute `npm test` to confirm all validations pass.

6. **Report**: Summarize what's correct and flag any issues found.

Icon name: $ARGUMENTS
