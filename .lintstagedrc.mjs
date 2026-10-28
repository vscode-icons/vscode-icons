export default {
  '**/*': ['prettier --write', 'eslint --fix'],
  '**/*.md': stagedFiles => `remark ${stagedFiles.join(' ')} --output`,
  '**/*.svg': ['svglint --ci'],
};
