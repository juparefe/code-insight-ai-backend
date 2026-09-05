import { Router } from 'express';

import { analyzeRepositoryController } from '../../analysis-container.js';

export const analysisRouter = Router();

analysisRouter.post(
  '/repositories/analyze',
  (req, res, next) => {
    analyzeRepositoryController
      .handle(req, res)
      .catch(next);
  },
);