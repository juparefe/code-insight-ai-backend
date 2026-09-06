import type { SQSEvent } from "aws-lambda";

import { processAnalysisJob } from "./modules/analysis/analysis-worker-container.js";

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);

    await processAnalysisJob.execute(message);
  }
};