import type { AiAnalysisContext } from "../models/ai-analysis-context.js";
import type { RepositoryAnalysis } from "../models/repository-analysis.js";

export interface AiAnalyzer {
  analyze(context: AiAnalysisContext): Promise<RepositoryAnalysis>;
}
