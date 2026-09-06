import { AppError } from "../../../../shared/errors/app-error.js";

import type { RepositoryFetcher } from "../../../repository/application/ports/repository-fetcher.js";
import type { RepositoryWorkspace } from "../../../repository/application/ports/repository-workspace.js";
import type { RepositorySource } from "../../../repository/domain/repository-source.js";

import type { AnalysisJob } from "../../domain/analysis-job.js";

import type { CreateAnalysisJob } from "./create-analysis-job.use-case.js";
import type { RepositoryClassifier } from "../ports/repository-classifier.js";

import {
  AnalyzeRepositoryUseCase,
} from "./analyze-repository.use-case.js";

export interface ProcessAnalysisRequestInput {
  source: RepositorySource;
}

export type ProcessAnalysisRequestResult =
  | {
      type: "SYNC";
      result: unknown;
    }
  | {
      type: "ASYNC";
      job: AnalysisJob;
    };

export class ProcessAnalysisRequest {
  constructor(
    private readonly repositoryFetcher: RepositoryFetcher,
    private readonly repositoryWorkspace: RepositoryWorkspace,
    private readonly repositoryClassifier: RepositoryClassifier,
    private readonly analyzeRepositoryUseCase: AnalyzeRepositoryUseCase,
    private readonly createAnalysisJob: CreateAnalysisJob,
  ) {}

  async execute(
    input: ProcessAnalysisRequestInput,
  ): Promise<ProcessAnalysisRequestResult> {
    let repositoryPath: string | undefined;

    try {
      const repositoryFetchTimer = Date.now();

      repositoryPath = await this.repositoryFetcher.fetch(input.source);

      console.log(
        `[ANALYSIS] Repository fetch completed`,
        `durationMs=${Date.now() - repositoryFetchTimer}`,
      );

      console.log(`Repository available at: ${repositoryPath}`);

      const classificationTimer = Date.now();

      const classification =
        await this.repositoryClassifier.classify(repositoryPath);

      console.log(
        `[ANALYSIS] Repository classification completed`,
        `durationMs=${Date.now() - classificationTimer}`,
      );

      console.log(
        `Repository classification: files=${classification.fileCount}, ` +
          `sizeBytes=${classification.sizeBytes}, ` +
          `sizeMb=${classification.sizeMb}, ` +
          `isLarge=${classification.isLarge}`,
      );

      if (classification.isLarge) {
        const job = await this.createAnalysisJob.execute();

        return {
          type: "ASYNC",
          job,
        };
      }

      const result =
        await this.analyzeRepositoryUseCase.executeFromPath({
          source: input.source,
          repositoryPath,
        });

      return {
        type: "SYNC",
        result,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error(
        "Analysis request processing failed:",
        error,
      );

      throw new AppError(
        500,
        "Analysis request failed",
        "ANALYSIS_REQUEST_FAILED",
      );
    } finally {
      if (repositoryPath) {
        await this.repositoryWorkspace.cleanup(repositoryPath);
      }
    }
  }
}