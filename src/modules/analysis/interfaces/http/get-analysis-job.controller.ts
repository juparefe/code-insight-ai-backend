import type { Request, Response } from 'express';

import { GetAnalysisJob } from '../../application/use-cases/get-analysis-job.use-case.js';
import { getAnalysisJobParamsSchema } from './get-analysis-job.dto.js';

export class GetAnalysisJobController {
  constructor(
    private readonly getAnalysisJob: GetAnalysisJob,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const { jobId } = getAnalysisJobParamsSchema.parse(req.params);

    const job = await this.getAnalysisJob.execute(jobId);

    res.status(200).json(job);
  }
}