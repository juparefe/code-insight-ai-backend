// Administrar workspace temporal
export interface RepositoryWorkspace {
  cleanup(path: string): Promise<void>;
}