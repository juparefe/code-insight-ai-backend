import { Router } from "express";

import {
  analyzeRepositoryController,
  getAnalysisJobController,
} from "../../analysis-container.js";

export const analysisRouter = Router();

analysisRouter.post("/repositories/analyze", (req, res, next) => {
  analyzeRepositoryController.handle(req, res).catch(next);
});

analysisRouter.get("/repositories/analyze/:jobId", (req, res, next) => {
  getAnalysisJobController.handle(req, res).catch(next);
});
