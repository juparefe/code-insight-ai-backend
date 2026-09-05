import fs from 'fs-extra';

import { GitHubRepositoryFetcher } from './modules/repository/infrastructure/github/github-repository-fetcher.js';

const fetcher = new GitHubRepositoryFetcher();

const repositoryPath = await fetcher.fetch({
  type: 'GITHUB',
  url: 'https://github.com/octocat/Hello-World.git',
});

console.log('Repository downloaded to:');
console.log(repositoryPath);

const files = await fs.readdir(repositoryPath);

console.log('\nRepository contents:');
console.log(files);