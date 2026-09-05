import type { Request, Response } from 'express';

import { analyzeRepositorySchema } from './analyze-repository.dto.js';
import { AnalyzeRepositoryUseCase } from '../../application/analyze-repository.use-case.js';

export class AnalyzeRepositoryController {
  constructor(
    private readonly analyzeRepositoryUseCase: AnalyzeRepositoryUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const input = analyzeRepositorySchema.parse(req.body);

    const analysisResult = await this.analyzeRepositoryUseCase.execute({
      source: input.source,
    });

    res.status(200).json(analysisResult);
  }
}