export type ArchitecturePattern =
  | "MONOLITH"
  | "MVC"
  | "CLEAN_ARCHITECTURE"
  | "HEXAGONAL"
  | "MICROSERVICES"
  | "N_LAYER";

export type FindingSeverity = "HIGH" | "MEDIUM" | "LOW";

export type FindingCategory =
  | "SECURITY"
  | "RELIABILITY"
  | "PERFORMANCE"
  | "MAINTAINABILITY"
  | "TESTING"
  | "ARCHITECTURE"
  | "DEPENDENCIES";

export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ArchitectureAnalysis {
  pattern: ArchitecturePattern;
  confidence: number;
  evidence: string[];
}

export interface AiTechnology {
  name: string;
  role: string;
  evidence: string[];
}

export interface AiComponent {
  type: string;
  name: string;
  path: string;
  responsibility: string;
  evidence: string[];
}

export interface Finding {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  evidence: string[];
}

export interface Recommendation {
  priority: RecommendationPriority;
  title: string;
  description: string;
  reason: string;
}

export interface RepositoryAnalysis {
  functionalDescription: string;
  architecture: ArchitectureAnalysis;
  technologies: AiTechnology[];
  components: AiComponent[];
  findings: Finding[];
  recommendations: Recommendation[];
}
