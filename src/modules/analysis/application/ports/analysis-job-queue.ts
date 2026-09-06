import type { AnalysisJobMessage } from "../models/analysis-job-message.js";

export interface AnalysisJobQueue {
  send(message: AnalysisJobMessage): Promise<void>;
}