export interface ComponentDetection {
  type:
    | "CONTROLLER"
    | "SERVICE"
    | "REPOSITORY"
    | "MODEL"
    | "COMPONENT"
    | "ROUTE"
    | "MIDDLEWARE"
    | "OTHER";

  name: string;
  path: string;
  evidence: string[];
}

export interface DependencyInfo {
  name: string;
  version?: string;
  type: "RUNTIME" | "DEV";
}

export interface EndpointDetection {
  method: string;
  path: string;
  file: string;
  evidence: string;
}

export interface FileInfo {
  path: string;
  extension: string;
  sizeBytes: number;
  category: FileCategory;
}

export interface FrameworkDetection {
  name: string;
  confidence: number;
  evidence: string[];
}

export interface ImportantFile {
  path: string;
  type:
    | 'PACKAGE_MANIFEST'
    | 'README'
    | 'DOCKER'
    | 'COMPOSE'
    | 'TYPESCRIPT_CONFIG'
    | 'ANGULAR_CONFIG'
    | 'JAVA_BUILD'
    | 'APPLICATION_CONFIG'
    | 'OTHER';
  priority: 'HIGH' | 'MEDIUM';
}

export interface LanguageDetection {
  name: string;
  fileCount: number;
  percentage: number;
}

export interface RepositoryStatistics {
  totalFiles: number;
  sourceFiles: number;
  testFiles: number;
  configurationFiles: number;
  documentationFiles: number;
}

export interface StaticAnalyzer {
  analyze(repositoryPath: string): Promise<StaticAnalysisResult>;
}

export interface StaticAnalysisResult {
  components: ComponentDetection[];
  dependencies: DependencyInfo[];
  directories: string[];
  endpoints: EndpointDetection[];
  files: FileInfo[];
  frameworks: FrameworkDetection[];
  importantFiles: ImportantFile[];
  languages: LanguageDetection[];
  statistics: RepositoryStatistics;
}

export type FileCategory =
  "SOURCE" | "TEST" | "CONFIGURATION" | "DOCUMENTATION" | "OTHER";
