import { AppError } from "../../../../shared/errors/app-error.js";
import type { RepositorySource } from "../../../repository/domain/repository-source.js";
import type { RepositoryFetcher } from "../../../repository/application/ports/repository-fetcher.js";
import type { RepositoryWorkspace } from "../../../repository/application/ports/repository-workspace.js";
import type { StaticAnalyzer } from "../ports/static-analyzer.js";
import type { AiAnalysisContextBuilder } from "../services/ai-analysis-context-builder.js";
import type { SourceCodeContextBuilder } from "../services/source-code-context-builder.js";
import type { AiAnalyzer } from "../ports/ai-analyzer.js";
import type { RepositoryAnalysis } from "../models/repository-analysis.js";
import { OperationTimer } from "../../../../shared/utils/operation-timer.js";

export interface AnalyzeRepositoryInput {
  source: RepositorySource;
}

export interface AnalyzeRepositoryFromPathInput {
  source: RepositorySource;
  repositoryPath: string;
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
    try {
      const fetchTimer = new OperationTimer("Repository fetch");
      repositoryPath = await this.repositoryFetcher.fetch(input.source);
      fetchTimer.end();
      console.log(`Repository available at: ${repositoryPath}`);

      return await this.executeFromPath({
        source: input.source,
        repositoryPath,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error(
        "Repository analysis failed with an unexpected error:",
        error,
      );

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

  async executeFromPath(
    input: AnalyzeRepositoryFromPathInput,
  ): Promise<RepositoryAnalysis> {
    const { source, repositoryPath } = input;
    const { url, type } = source;
    const totalTimer = new OperationTimer("Total analysis");
    try {
      const staticTimer = new OperationTimer("Static analysis");
      const staticAnalysis = await this.staticAnalyzer.analyze(repositoryPath);
      staticTimer.end();

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

      const claudeTimer = new OperationTimer("Claude analysis");
      const aiAnalysisResult = await this.aiAnalyzer.analyze(aiAnalysisContext);
      claudeTimer.end();

      totalTimer.end();
      return aiAnalysisResult;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error(
        "Repository analysis failed with an unexpected error:",
        error,
      );

      throw new AppError(
        500,
        "Repository analysis failed",
        "REPOSITORY_ANALYSIS_FAILED",
      );
    }
  }
}
