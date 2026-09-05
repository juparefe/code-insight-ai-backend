import { AppError } from "../../../shared/errors/app-error.js";
import type { RepositorySource } from "../../repository/domain/repository-source.js";
import type { RepositoryFetcher } from "../../repository/application/ports/repository-fetcher.js";
import type { RepositoryWorkspace } from "../../repository/application/ports/repository-workspace.js";
import type { StaticAnalyzer } from "./ports/static-analyzer.js";
import type { AiAnalysisContextBuilder } from "./services/ai-analysis-context-builder.js";
import type { SourceCodeContextBuilder } from "./services/source-code-context-builder.js";
import type { AiAnalyzer } from "./ports/ai-analyzer.js";
import type { RepositoryAnalysis } from "./models/repository-analysis.js";

export interface AnalyzeRepositoryInput {
  source: RepositorySource;
}

export class AnalyzeRepositoryUseCase {
  constructor(
    private readonly aiAnalysisContextBuilder: AiAnalysisContextBuilder,
    private readonly aiAnalyzer: AiAnalyzer,
    private readonly repositoryFetcher: RepositoryFetcher,
    private readonly repositoryWorkspace: RepositoryWorkspace,
    private readonly sourceCodeContextBuilder: SourceCodeContextBuilder,
    private readonly staticAnalyzer: StaticAnalyzer,
  ) {}

  async execute(input: AnalyzeRepositoryInput): Promise<RepositoryAnalysis> {
    let repositoryPath: string | undefined;
    const source = input.source;
    const { url, type } = source;

    try {
      repositoryPath = await this.repositoryFetcher.fetch(input.source);
      console.log(`Repository available at: ${repositoryPath}`);

      const staticAnalysis = await this.staticAnalyzer.analyze(repositoryPath);
      const sourceFiles = await this.sourceCodeContextBuilder.build({
        repositoryPath,
        staticAnalysis,
      });
      const aiAnalysisContext = this.aiAnalysisContextBuilder.build({
        repositoryName: url,
        sourceType: type,
        staticAnalysis,
        sourceFiles,
      });
      const aiAnalysisResult = await this.aiAnalyzer.analyze(aiAnalysisContext);
      return aiAnalysisResult;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Repository analysis failed",
        "REPOSITORY_ANALYSIS_FAILED",
      );
    } finally {
      if (repositoryPath) {
        await this.repositoryWorkspace.cleanup(repositoryPath);
      }
    }
  }
}
