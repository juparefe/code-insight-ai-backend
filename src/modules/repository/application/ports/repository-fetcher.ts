import type { RepositorySource } from '../../domain/repository-source.js';

// Obtener repositorio
export interface RepositoryFetcher {
  fetch(source: RepositorySource): Promise<string>;
}