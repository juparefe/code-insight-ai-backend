export type AnalysisJobStatus =
  | 'PENDING'
  | 'DOWNLOADING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface AnalysisJob {
  id: string;
  status: AnalysisJobStatus;
  createdAt: string;
  updatedAt: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
}