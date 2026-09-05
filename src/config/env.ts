import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  BEDROCK_MODEL_ID: z.string().default('global.anthropic.claude-sonnet-4-6'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  TEMP_DIRECTORY: z.string().default('./tmp'),
});

export const env = envSchema.parse(process.env);