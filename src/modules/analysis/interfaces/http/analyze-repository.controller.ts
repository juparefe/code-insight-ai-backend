import type { Request, Response } from "express";

import { analyzeRepositorySchema } from "./analyze-repository.dto.js";

import type { ProcessAnalysisRequest } from "../../application/use-cases/process-analysis-request.use-case.js";

export class AnalyzeRepositoryController {
  constructor(
    private readonly processAnalysisRequest: ProcessAnalysisRequest,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const input = analyzeRepositorySchema.parse(req.body);

    const result = await this.processAnalysisRequest.execute({
      source: input.source,
    });

    if (result.type === "ASYNC") {
      res.status(202).json({
        jobId: result.job.id,
        status: result.job.status,
      });

      return;
    }

    res.status(200).json({
      status: "COMPLETED",
      result: result.result,
    });
  }
}