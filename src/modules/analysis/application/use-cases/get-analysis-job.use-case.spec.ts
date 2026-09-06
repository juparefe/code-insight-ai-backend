import { describe, expect, it } from '@jest/globals';

import { GetAnalysisJob } from './get-analysis-job.use-case.js';
import { InMemoryAnalysisJobRepository } from '../../infrastructure/jobs/in-memory-analysis-job-repository.js';

describe('GetAnalysisJob', () => {
  it('should return an existing analysis job', async () => {
    const repository = new InMemoryAnalysisJobRepository();

    const job = {
      id: 'job-123',
      status: 'PROCESSING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repository.create(job);

    const useCase = new GetAnalysisJob(repository);

    const result = await useCase.execute('job-123');

    expect(result).toEqual(job);
  });

  it('should throw when the job does not exist', async () => {
    const repository = new InMemoryAnalysisJobRepository();

    const useCase = new GetAnalysisJob(repository);

    await expect(
      useCase.execute('does-not-exist'),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'ANALYSIS_JOB_NOT_FOUND',
    });
  });
});