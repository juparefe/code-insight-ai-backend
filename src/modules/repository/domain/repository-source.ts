export type RepositorySourceType = 'GITHUB';

export interface RepositorySource {
  type: RepositorySourceType;
  url: string;
}