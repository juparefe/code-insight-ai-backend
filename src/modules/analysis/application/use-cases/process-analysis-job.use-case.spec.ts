import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { ProcessAnalysisJob } from './process-analysis-job.use-case.js';
import type { AnalyzeRepositoryUseCase } from './analyze-repository.use-case.js';
import type { GetAnalysisJob } from './get-analysis-job.use-case.js';
import type { UpdateAnalysisJob } from './update-analysis-job.use-case.js';
import type { AnalysisJob } from '../../domain/analysis-job.js';
import type { AnalysisJobMessage } from '../ports/analysis-job-queue.js';
import type { RepositoryAnalysis } from '../models/repository-analysis.js';

const message: AnalysisJobMessage = {
  jobId: 'job-1',
  source: { type: 'GITHUB', url: 'https://github.com/acme/repo' },
};

const analysisResult: RepositoryAnalysis = {
  functionalDescription: 'A sample service.',
  architecture: { pattern: 'MVC', confidence: 0.8, evidence: [] },
  technologies: [],
  components: [],
  findings: [],
  recommendations: [],
};

const pendingJob: AnalysisJob = {
  id: 'job-1',
  status: 'PENDING',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const processingJob: AnalysisJob = {
  ...pendingJob,
  status: 'PROCESSING',
};

function buildDeps() {
  const getAnalysisJob = {
    execute: jest.fn<GetAnalysisJob['execute']>().mockResolvedValue(pendingJob),
  };
  const updateAnalysisJob = {
    execute: jest
      .fn<UpdateAnalysisJob['execute']>()
      .mockResolvedValue(processingJob),
  };
  const analyzeRepositoryUseCase = {
    execute: jest.fn<AnalyzeRepositoryUseCase['execute']>(),
    executeFromPath: jest.fn<AnalyzeRepositoryUseCase['executeFromPath']>(),
  };

  const useCase = new ProcessAnalysisJob(
    analyzeRepositoryUseCase as unknown as AnalyzeRepositoryUseCase,
    getAnalysisJob as unknown as GetAnalysisJob,
    updateAnalysisJob as unknown as UpdateAnalysisJob,
  );

  return { getAnalysisJob, updateAnalysisJob, analyzeRepositoryUseCase, useCase };
}

describe('ProcessAnalysisJob', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('GIVEN a queued analysis message WHEN the job is processed THEN it is moved to PROCESSING before the analysis runs', async () => {
    const { useCase, getAnalysisJob, updateAnalysisJob, analyzeRepositoryUseCase } =
      buildDeps();
    analyzeRepositoryUseCase.execute.mockResolvedValue(analysisResult);

    await useCase.execute(message);

    expect(getAnalysisJob.execute).toHaveBeenCalledWith('job-1');
    expect(updateAnalysisJob.execute).toHaveBeenNthCalledWith(1, pendingJob, {
      status: 'PROCESSING',
    });
  });

  it('GIVEN an analysis that succeeds WHEN the job is processed THEN the job is marked COMPLETED with the analysis result', async () => {
    const { useCase, updateAnalysisJob, analyzeRepositoryUseCase } = buildDeps();
    analyzeRepositoryUseCase.execute.mockResolvedValue(analysisResult);

    await useCase.execute(message);

    expect(analyzeRepositoryUseCase.execute).toHaveBeenCalledWith({
      source: message.source,
    });
    expect(updateAnalysisJob.execute).toHaveBeenNthCalledWith(2, processingJob, {
      status: 'COMPLETED',
      result: analysisResult,
    });
  });

  it('GIVEN an analysis that throws WHEN the job is processed THEN the job is marked FAILED and the error is rethrown', async () => {
    const { useCase, updateAnalysisJob, analyzeRepositoryUseCase } = buildDeps();
    const failure = new Error('analysis exploded');
    analyzeRepositoryUseCase.execute.mockRejectedValue(failure);

    await expect(useCase.execute(message)).rejects.toThrow('analysis exploded');

    expect(updateAnalysisJob.execute).toHaveBeenNthCalledWith(2, processingJob, {
      status: 'FAILED',
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Repository analysis failed',
      },
    });
  });

  it('GIVEN a job id that cannot be loaded WHEN the job is processed THEN the error propagates and no update is attempted', async () => {
    const { useCase, getAnalysisJob, updateAnalysisJob } = buildDeps();
    getAnalysisJob.execute.mockRejectedValue(new Error('not found'));

    await expect(useCase.execute(message)).rejects.toThrow('not found');

    expect(updateAnalysisJob.execute).not.toHaveBeenCalled();
  });
});
