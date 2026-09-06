import type { RepositorySource } from "../../../repository/domain/repository-source.js";

export interface AnalysisJobMessage {
  jobId: string;
  source: RepositorySource;
}