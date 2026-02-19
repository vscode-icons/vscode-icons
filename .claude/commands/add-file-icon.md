Add a new file icon to vscode-icons.

The user will provide the icon name and the file extensions/filenames it should match.

## Steps:

1. **Research**: Search the web for the tool/technology to understand what file extensions and config filenames it uses. Also look for official brand colors and logo design.

2. **Check for duplicates**: Search `src/iconsManifest/supportedExtensions.ts` to make sure this icon doesn't already exist.

3. **Create SVG**: The user should ideally provide an SVG icon file. If they haven't, ask them if they'd like to provide one. If they want you to generate it, create an SVG at `icons/file_type_{name}.svg` with viewBox="0 0 32 32" but **warn them that AI-generated SVGs are approximate** and may need manual refinement to match official branding. Try to match the official branding as closely as possible.

4. **Add configuration**: Add an entry to `src/iconsManifest/supportedExtensions.ts` in alphabetical order by icon name. Use the correct pattern:
   - For file extensions (no leading dot): `{ icon: 'name', extensions: ['ext'], format: FileFormat.svg }`
   - For filenames: `{ icon: 'name', extensions: ['.configrc'], filename: true, format: FileFormat.svg }`
   - For language IDs: Add to `languages.ts` first, then `{ icon: 'name', extensions: [], languages: [languages.lang], format: FileFormat.svg }`

5. **Validate**: Run `npm test` to ensure all specs pass.

6. **Report**: Show the user what was created and which files were modified.

User input: $ARGUMENTS
