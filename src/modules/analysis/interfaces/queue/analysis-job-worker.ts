import type { AnalysisJobMessage } from "../../application/ports/analysis-job-queue.js";

export class AnalysisJobWorker {
  constructor(
    private readonly processJob: (
      message: AnalysisJobMessage,
    ) => Promise<void>,
  ) {}

  async handle(message: AnalysisJobMessage): Promise<void> {
    await this.processJob(message);
  }
}