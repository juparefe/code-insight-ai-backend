import type { RepositorySource } from '../../domain/repository-source.js';

export interface RepositoryFetcher {
  fetch(source: RepositorySource): Promise<string>;
}