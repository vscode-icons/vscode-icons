export default {
  '**/*': ['prettier --write', 'eslint --fix'],
  '**/*.md': stagedFiles => ['remark', ...stagedFiles, '--output'].join(' '),
};
