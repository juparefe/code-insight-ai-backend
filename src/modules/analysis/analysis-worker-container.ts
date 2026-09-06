import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { env } from "../../config/env.js";

import { GitHubRepositoryFetcher } from "../repository/infrastructure/github/github-repository-fetcher.js";
import { FilesystemRepositoryWorkspace } from "../repository/infrastructure/github/filesystem-repository-workspace.js";

import { RepositoryStaticAnalyzer } from "./infrastructure/static-analysis/repository-static-analyzer.js";
import { ComponentDetector } from "./infrastructure/static-analysis/component-detector.js";
import { EndpointDetector } from "./infrastructure/static-analysis/endpoint-detector.js";
import { ImportantFileDetector } from "./infrastructure/static-analysis/important-file-detector.js";

import { AiAnalysisContextBuilder } from "./application/services/ai-analysis-context-builder.js";
import { SourceCodeContextBuilder } from "./application/services/source-code-context-builder.js";

import { BedrockAnalyzer } from "./infrastructure/ai/bedrock-analyzer.js";

import { DynamoDbAnalysisJobRepository } from "./infrastructure/jobs/dynamodb-analysis-job-repository.js";

import { GetAnalysisJob } from "./application/use-cases/get-analysis-job.use-case.js";
import { UpdateAnalysisJob } from "./application/use-cases/update-analysis-job.use-case.js";

import { AnalyzeRepositoryUseCase } from "./application/use-cases/analyze-repository.use-case.js";
import { ProcessAnalysisJob } from "./application/use-cases/process-analysis-job.use-case.js";

const dynamoDbClient = new DynamoDBClient({
  region: env.AWS_REGION,
});

const analysisJobRepository = new DynamoDbAnalysisJobRepository(
  env.ANALYSIS_JOBS_TABLE_NAME,
  dynamoDbClient,
);

const getAnalysisJob = new GetAnalysisJob(analysisJobRepository);

const updateAnalysisJob = new UpdateAnalysisJob(analysisJobRepository);

const aiAnalysisContextBuilder = new AiAnalysisContextBuilder();

const bedrockAnalyzer = new BedrockAnalyzer(
  env.BEDROCK_MODEL_ID,
  env.AWS_REGION,
);

const componentDetector = new ComponentDetector();

const endpointDetector = new EndpointDetector();

const importantFileDetector = new ImportantFileDetector();

const staticAnalyzer = new RepositoryStaticAnalyzer(
  componentDetector,
  endpointDetector,
  importantFileDetector,
);

const sourceCodeContextBuilder = new SourceCodeContextBuilder();

const repositoryFetcher = new GitHubRepositoryFetcher();

const repositoryWorkspace = new FilesystemRepositoryWorkspace();

const analyzeRepositoryUseCase = new AnalyzeRepositoryUseCase(
  aiAnalysisContextBuilder,
  bedrockAnalyzer,
  repositoryFetcher,
  repositoryWorkspace,
  sourceCodeContextBuilder,
  staticAnalyzer,
);

const processAnalysisJob = new ProcessAnalysisJob(
  analyzeRepositoryUseCase,
  getAnalysisJob,
  updateAnalysisJob,
);

export { processAnalysisJob };
