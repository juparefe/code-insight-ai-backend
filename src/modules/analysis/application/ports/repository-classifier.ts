export interface RepositoryClassification {
    fileCount: number;
    sizeBytes: number;
    isLarge: boolean;
}

export interface RepositoryClassifier {
    classify(repositoryPath: string): Promise<RepositoryClassification>;
}