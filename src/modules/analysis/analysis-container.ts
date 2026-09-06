import { AnalyzeRepositoryUseCase } from "./application/use-cases/analyze-repository.use-case.js";
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
import { InMemoryAnalysisJobRepository } from "./infrastructure/jobs/in-memory-analysis-job-repository.js";
import { GetAnalysisJob } from "./application/use-cases/get-analysis-job.use-case.js";
import { UpdateAnalysisJob } from "./application/use-cases/update-analysis-job.use-case.js";
import { CreateAnalysisJob } from "./application/use-cases/create-analysis-job.use-case.js";
import { GetAnalysisJobController } from "./interfaces/http/get-analysis-job.controller.js";
import { FilesystemRepositoryClassifier } from "./infrastructure/repository/repository-classifier.js";
import { ProcessAnalysisRequest } from "./application/use-cases/process-analysis-request.use-case.js";

const aiAnalysisContextBuilder = new AiAnalysisContextBuilder();
const bedrockAnalyzer = new BedrockAnalyzer(
  env.BEDROCK_MODEL_ID,
  env.AWS_REGION,
);
const componentDetector = new ComponentDetector();
const endpointDetector = new EndpointDetector();
const importantFileDetector = new ImportantFileDetector();
const repositoryClassifier = new FilesystemRepositoryClassifier();
const repositoryFetcher = new GitHubRepositoryFetcher();
const repositoryWorkspace = new FilesystemRepositoryWorkspace();
const analysisJobRepository = new InMemoryAnalysisJobRepository();
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
const createAnalysisJob = new CreateAnalysisJob(analysisJobRepository);
const updateAnalysisJob = new UpdateAnalysisJob(analysisJobRepository);
const getAnalysisJob = new GetAnalysisJob(analysisJobRepository);

const processAnalysisRequest = new ProcessAnalysisRequest(
  repositoryFetcher,
  repositoryWorkspace,
  repositoryClassifier,
  analyzeRepositoryUseCase,
  createAnalysisJob,
);

export const analyzeRepositoryController = new AnalyzeRepositoryController(
  processAnalysisRequest,
);

export const getAnalysisJobController = new GetAnalysisJobController(
  getAnalysisJob,
);
