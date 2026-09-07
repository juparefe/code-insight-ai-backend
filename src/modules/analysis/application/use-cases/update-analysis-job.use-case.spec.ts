import { describe, expect, it } from '@jest/globals';

import { UpdateAnalysisJob } from './update-analysis-job.use-case.js';
import { InMemoryAnalysisJobRepository } from '../../infrastructure/jobs/in-memory-analysis-job-repository.js';
import type { AnalysisJob } from '../../domain/analysis-job.js';

function buildJob(overrides: Partial<AnalysisJob> = {}): AnalysisJob {
  return {
    id: 'job-1',
    status: 'PENDING',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('UpdateAnalysisJob', () => {
  it('GIVEN an existing job WHEN it is updated with a new status THEN the status changes and updatedAt is refreshed', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, { status: 'PROCESSING' });

    expect(updated.status).toBe('PROCESSING');
    expect(updated.updatedAt).not.toBe(job.updatedAt);
  });

  it('GIVEN an existing job WHEN it is updated THEN the original id and createdAt are preserved', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, { status: 'COMPLETED' });

    expect(updated.id).toBe(job.id);
    expect(updated.createdAt).toBe(job.createdAt);
  });

  it('GIVEN an update input carrying a result WHEN the job is updated THEN the result is attached', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, {
      status: 'COMPLETED',
      result: { summary: 'ok' },
    });

    expect(updated.result).toEqual({ summary: 'ok' });
  });

  it('GIVEN an update input carrying an error WHEN the job is updated THEN the error is attached', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, {
      status: 'FAILED',
      error: { code: 'ANALYSIS_FAILED', message: 'boom' },
    });

    expect(updated.error).toEqual({
      code: 'ANALYSIS_FAILED',
      message: 'boom',
    });
  });

  it('GIVEN an update input without result or error WHEN the job is updated THEN no result or error keys are added', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, { status: 'PROCESSING' });

    expect(updated).not.toHaveProperty('result');
    expect(updated).not.toHaveProperty('error');
  });

  it('GIVEN an existing job WHEN it is updated THEN the updated job is persisted in the repository', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const job = buildJob();
    await repository.create(job);
    const useCase = new UpdateAnalysisJob(repository);

    const updated = await useCase.execute(job, { status: 'PROCESSING' });

    await expect(repository.findById(job.id)).resolves.toEqual(updated);
  });
});
