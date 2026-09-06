import { AppError } from '../../../../shared/errors/app-error.js';

import type { AnalysisJob } from '../../domain/analysis-job.js';
import type { AnalysisJobRepository } from '../ports/analysis-job-repository.js';

export class GetAnalysisJob {
  constructor(
    private readonly analysisJobRepository: AnalysisJobRepository,
  ) {}

  async execute(id: string): Promise<AnalysisJob> {
    const job = await this.analysisJobRepository.findById(id);

    if (!job) {
      throw new AppError(
        404,
        'Analysis job not found',
        'ANALYSIS_JOB_NOT_FOUND',
      );
    }

    return job;
  }
}