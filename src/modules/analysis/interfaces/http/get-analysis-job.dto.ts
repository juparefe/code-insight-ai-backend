import { z } from 'zod';

export const getAnalysisJobParamsSchema = z.object({
  jobId: z.string().uuid(),
});
