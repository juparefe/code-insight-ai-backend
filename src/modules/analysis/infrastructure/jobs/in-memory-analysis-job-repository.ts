import type { AnalysisJob } from '../../domain/analysis-job.js';
import type { AnalysisJobRepository } from '../../application/ports/analysis-job-repository.js';

export class InMemoryAnalysisJobRepository
  implements AnalysisJobRepository
{
  private readonly jobs = new Map<string, AnalysisJob>();

  async create(job: AnalysisJob): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async findById(id: string): Promise<AnalysisJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async update(job: AnalysisJob): Promise<void> {
    this.jobs.set(job.id, job);
  }
}