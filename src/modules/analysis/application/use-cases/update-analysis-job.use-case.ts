import type {
  AnalysisJob,
  AnalysisJobStatus,
} from '../../domain/analysis-job.js';

import type { AnalysisJobRepository } from '../ports/analysis-job-repository.js';

interface UpdateAnalysisJobInput {
  status: AnalysisJobStatus;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

export class UpdateAnalysisJob {
  constructor(
    private readonly analysisJobRepository: AnalysisJobRepository,
  ) {}

  async execute(
    job: AnalysisJob,
    input: UpdateAnalysisJobInput,
  ): Promise<AnalysisJob> {
    const updatedJob: AnalysisJob = {
      ...job,
      status: input.status,
      updatedAt: new Date().toISOString(),
      ...(input.result !== undefined && {
        result: input.result,
      }),
      ...(input.error !== undefined && {
        error: input.error,
      }),
    };

    await this.analysisJobRepository.update(updatedJob);

    return updatedJob;
  }
}