import type { Request, Response } from "express";

import { analyzeRepositorySchema } from "./analyze-repository.dto.js";
import { AnalyzeRepositoryUseCase } from "../../application/use-cases/analyze-repository.use-case.js";
import type { UpdateAnalysisJob } from "../../application/use-cases/update-analysis-job.use-case.js";
import type { CreateAnalysisJob } from "../../application/use-cases/create-analysis-job.use-case.js";

export class AnalyzeRepositoryController {
  constructor(
    private readonly analyzeRepositoryUseCase: AnalyzeRepositoryUseCase,
    private readonly createAnalysisJob: CreateAnalysisJob,
    private readonly updateAnalysisJob: UpdateAnalysisJob,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const input = analyzeRepositorySchema.parse(req.body);
    const job = await this.createAnalysisJob.execute();

    await this.updateAnalysisJob.execute(job, {
      status: "PROCESSING",
    });

    try {
      const analysisResult = await this.analyzeRepositoryUseCase.execute({
        source: input.source,
      });

      await this.updateAnalysisJob.execute(
        {
          ...job,
          status: "PROCESSING",
        },
        {
          status: "COMPLETED",
          result: analysisResult,
        },
      );

      res.status(200).json({
        jobId: job.id,
        status: "COMPLETED",
        result: analysisResult,
      });
    } catch (error) {
      await this.updateAnalysisJob.execute(
        {
          ...job,
          status: "PROCESSING",
        },
        {
          status: "FAILED",
          error: {
            code: "ANALYSIS_FAILED",
            message: "Repository analysis failed",
          },
        },
      );

      throw error;
    }
  }
}
