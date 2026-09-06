export interface RepositoryWorkspace {
  cleanup(path: string): Promise<void>;
}