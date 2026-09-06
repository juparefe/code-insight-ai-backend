import type { AnalysisJob } from '../../domain/analysis-job.js';

export interface AnalysisJobRepository {
  create(job: AnalysisJob): Promise<void>;

  findById(id: string): Promise<AnalysisJob | null>;

  update(job: AnalysisJob): Promise<void>;
}