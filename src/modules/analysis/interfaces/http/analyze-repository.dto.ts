import { z } from 'zod';

export const analyzeRepositorySchema = z.object({
  source: z.object({
    type: z.literal('GITHUB'),
    url: z.url(),
  }),
});

export type AnalyzeRepositoryRequest = z.infer<
  typeof analyzeRepositorySchema
>;