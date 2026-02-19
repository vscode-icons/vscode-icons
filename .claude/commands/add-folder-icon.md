Add a new folder icon to vscode-icons.

The user will provide the folder icon name and the folder names it should match.

## Steps:

1. **Research**: Search the web for the tool/technology to understand what folder names it uses and its official branding/colors.

2. **Check for duplicates**: Search `src/iconsManifest/supportedFolders.ts` to make sure this icon doesn't already exist.

3. **Create SVGs**: Create TWO optimized SVG icon files with viewBox="0 0 32 32":
   - `icons/folder_type_{name}.svg` (collapsed state)
   - `icons/folder_type_{name}_opened.svg` (expanded state)
   The opened variant should visually indicate an open/expanded folder.

4. **Add configuration**: Add an entry to `src/iconsManifest/supportedFolders.ts` in alphabetical order:
   ```typescript
   { icon: 'name', extensions: ['foldername', '.foldername'], format: FileFormat.svg },
   ```

5. **Validate**: Run `npm test` to ensure all specs pass.

6. **Report**: Show the user what was created and which files were modified.

User input: $ARGUMENTS
