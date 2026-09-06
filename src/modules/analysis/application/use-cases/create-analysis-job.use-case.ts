import crypto from 'node:crypto';

import type { AnalysisJob } from '../../domain/analysis-job.js';
import type { AnalysisJobRepository } from '../ports/analysis-job-repository.js';

export class CreateAnalysisJob {
  constructor(
    private readonly analysisJobRepository: AnalysisJobRepository,
  ) {}

  async execute(): Promise<AnalysisJob> {
    const now = new Date().toISOString();

    const job: AnalysisJob = {
      id: crypto.randomUUID(),
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    await this.analysisJobRepository.create(job);

    return job;
  }
}