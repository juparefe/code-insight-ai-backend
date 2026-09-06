import type { AnalyzeRepositoryUseCase } from "./analyze-repository.use-case.js";
import type { GetAnalysisJob } from "./get-analysis-job.use-case.js";
import type { UpdateAnalysisJob } from "./update-analysis-job.use-case.js";
import type { AnalysisJobMessage } from "../ports/analysis-job-queue.js";

export class ProcessAnalysisJob {
  constructor(
    private readonly analyzeRepositoryUseCase: AnalyzeRepositoryUseCase,
    private readonly getAnalysisJob: GetAnalysisJob,
    private readonly updateAnalysisJob: UpdateAnalysisJob,
  ) {}

  async execute(message: AnalysisJobMessage): Promise<void> {
    const { jobId, source } = message;

    const job = await this.getAnalysisJob.execute(jobId);

    const processingJob = await this.updateAnalysisJob.execute(job, {
      status: "PROCESSING",
    });

    try {
      const result = await this.analyzeRepositoryUseCase.execute({
        source,
      });

      await this.updateAnalysisJob.execute(processingJob, {
        status: "COMPLETED",
        result,
      });
    } catch (error) {
      console.error(
        `Analysis job failed: ${jobId}`,
        error,
      );

      await this.updateAnalysisJob.execute(processingJob, {
        status: "FAILED",
        error: {
          code: "ANALYSIS_FAILED",
          message: "Repository analysis failed",
        },
      });

      throw error;
    }
  }
}