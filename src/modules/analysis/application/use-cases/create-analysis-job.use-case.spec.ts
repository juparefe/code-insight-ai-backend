import { describe, expect, it } from '@jest/globals';

import { CreateAnalysisJob } from './create-analysis-job.use-case.js';
import { InMemoryAnalysisJobRepository } from '../../infrastructure/jobs/in-memory-analysis-job-repository.js';

describe('CreateAnalysisJob', () => {
  it('GIVEN a new analysis request WHEN the job is created THEN its status is PENDING', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const useCase = new CreateAnalysisJob(repository);

    const job = await useCase.execute();

    expect(job.status).toBe('PENDING');
  });

  it('GIVEN a new analysis request WHEN the job is created THEN it is persisted and retrievable by id', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const useCase = new CreateAnalysisJob(repository);

    const job = await useCase.execute();

    await expect(repository.findById(job.id)).resolves.toEqual(job);
  });

  it('GIVEN a new analysis request WHEN the job is created THEN its id is a valid UUID', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const useCase = new CreateAnalysisJob(repository);

    const job = await useCase.execute();

    expect(job.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('GIVEN a new analysis request WHEN the job is created THEN createdAt and updatedAt hold the same ISO timestamp', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const useCase = new CreateAnalysisJob(repository);

    const job = await useCase.execute();

    expect(job.createdAt).toBe(job.updatedAt);
    expect(new Date(job.createdAt).toISOString()).toBe(job.createdAt);
  });

  it('GIVEN several analysis requests WHEN multiple jobs are created THEN each job gets a different id', async () => {
    const repository = new InMemoryAnalysisJobRepository();
    const useCase = new CreateAnalysisJob(repository);

    const first = await useCase.execute();
    const second = await useCase.execute();

    expect(first.id).not.toBe(second.id);
  });
});
