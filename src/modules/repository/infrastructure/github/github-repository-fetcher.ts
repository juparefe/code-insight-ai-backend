import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'fs-extra';
import { simpleGit } from 'simple-git';

import type { RepositorySource } from '../../domain/repository-source.js';
import type { RepositoryFetcher } from '../../application/ports/repository-fetcher.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { env } from '../../../../config/env.js';

export class GitHubRepositoryFetcher implements RepositoryFetcher {
  async fetch(source: RepositorySource): Promise<string> {
    this.validateUrl(source.url);

    const repositoryId = crypto.randomUUID();
    const repositoryPath = path.resolve(
      env.TEMP_DIRECTORY,
      repositoryId,
    );

    try {
      await fs.ensureDir(repositoryPath);

      const git = simpleGit();

      await git.clone(source.url, repositoryPath, [
        '--depth',
        '1',
      ]);

      return repositoryPath;
    } catch (error) {
      await fs.remove(repositoryPath);

      throw new AppError(
        422,
        'Unable to retrieve the GitHub repository',
        'REPOSITORY_FETCH_FAILED',
      );
    }
  }

  private validateUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);

      const isGitHub =
        parsedUrl.protocol === 'https:' &&
        parsedUrl.hostname === 'github.com';

      if (!isGitHub) {
        throw new Error('Invalid GitHub URL');
      }
    } catch {
      throw new AppError(
        400,
        'A valid public GitHub URL is required',
        'INVALID_REPOSITORY_URL',
      );
    }
  }
}