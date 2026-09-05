import { AnalyzeRepositoryUseCase } from "./application/analyze-repository.use-case.js";
import { AnalyzeRepositoryController } from "./interfaces/http/analyze-repository.controller.js";

import { GitHubRepositoryFetcher } from "../repository/infrastructure/github/github-repository-fetcher.js";
import { FilesystemRepositoryWorkspace } from "../repository/infrastructure/github/filesystem-repository-workspace.js";
import { RepositoryStaticAnalyzer } from "./infrastructure/static-analysis/repository-static-analyzer.js";
import { ComponentDetector } from "./infrastructure/static-analysis/component-detector.js";
import { EndpointDetector } from "./infrastructure/static-analysis/endpoint-detector.js";
import { ImportantFileDetector } from "./infrastructure/static-analysis/important-file-detector.js";
import { AiAnalysisContextBuilder } from "./application/services/ai-analysis-context-builder.js";
import { SourceCodeContextBuilder } from "./application/services/source-code-context-builder.js";
import { BedrockAnalyzer } from "./infrastructure/ai/bedrock-analyzer.js";
import { env } from "../../config/env.js";

const aiAnalysisContextBuilder = new AiAnalysisContextBuilder();
const bedrockAnalyzer = new BedrockAnalyzer(
  env.BEDROCK_MODEL_ID,
  env.AWS_REGION,
);
const componentDetector = new ComponentDetector();
const endpointDetector = new EndpointDetector();
const importantFileDetector = new ImportantFileDetector();
const repositoryFetcher = new GitHubRepositoryFetcher();
const repositoryWorkspace = new FilesystemRepositoryWorkspace();
const staticAnalyzer = new RepositoryStaticAnalyzer(
  componentDetector,
  endpointDetector,
  importantFileDetector,
);
const sourceCodeContextBuilder = new SourceCodeContextBuilder();

const analyzeRepositoryUseCase = new AnalyzeRepositoryUseCase(
  aiAnalysisContextBuilder,
  bedrockAnalyzer,
  repositoryFetcher,
  repositoryWorkspace,
  sourceCodeContextBuilder,
  staticAnalyzer,
);

export const analyzeRepositoryController = new AnalyzeRepositoryController(
  analyzeRepositoryUseCase,
);
