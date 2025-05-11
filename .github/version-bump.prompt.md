---
mode: 'agent'
description: 'Bump the version of the project according to semantic versioning (semver).'
---

# Version Bump Prompt

This prompt is designed to assist with bumping the version of the project following semantic versioning (semver).

## Instructions

0. Be sure you're in the master branch of the repository. Then do a `git pull` to ensure you have the latest changes.
1. Locate the `version` field in both `package.json` and `package-lock.json` files in the root of the workspace.
   - The `package.json` file contains the version of the project.
2. They can be located here:
   - `package.json`: `./package.json`
   - `package-lock.json`: `./package-lock.json`
3. The version number is typically in the format `x.y.z` (letters being numbers here), where:
   - `x` is the major version
   - `y` is the minor version
   - `z` is the patch version
4. Ask the user about the kind of version bump and update the version number that you got in the `package.json` file according to the type of version bump:
   - **Major**: Increment the first number (e.g., `1.0.0` → `2.0.0`) for breaking changes.
   - **Minor**: Increment the second number (e.g., `1.0.0` → `1.1.0`) for new features that are backward-compatible.
   - **Patch**: Increment the third number (e.g., `1.0.0` → `1.0.1`) for bug fixes.
5. Ensure that the version numbers in both files are consistent.
   - If you update the version in `package.json`, make sure to update it in `package-lock.json` as well.
   - You can use a command like `npm install` to automatically update the `package-lock.json` file after changing the version in `package.json`.
6. Save the changes.
7. Create a new branch for the version bump. You can name it something like `chore/version-bump/x.y.z`, where `x.y.z` is the new version number.
8. Commit the changes with a message like `chore(version): bump version to x.y.z`, where `x.y.z` is the new version number.
9. Push the changes to the repository.

## Notes

- Follow the semver guidelines strictly to maintain compatibility.
- Double-check for any dependencies or scripts that might rely on the version number.
#codebase
