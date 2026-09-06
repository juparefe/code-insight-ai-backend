import "dotenv/config";
import { z } from "zod";
import os from "node:os";

const envSchema = z.object({
  AWS_REGION: z.string().default("us-east-1"),
  BEDROCK_MODEL_ID: z.string().default("global.anthropic.claude-sonnet-4-6"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),
  TEMP_DIRECTORY: z.string().default(os.tmpdir()),
  MAX_REPOSITORY_FILES: z.coerce.number().int().positive().default(10),
  MAX_REPOSITORY_SIZE_MB: z.coerce.number().positive().default(1),
  ANALYSIS_JOBS_QUEUE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
