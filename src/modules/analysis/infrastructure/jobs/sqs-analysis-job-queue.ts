import {
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

import type {
  AnalysisJobMessage,
  AnalysisJobQueue,
} from "../../application/ports/analysis-job-queue.js";

export class SqsAnalysisJobQueue implements AnalysisJobQueue {
  constructor(
    private readonly client: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async send(message: AnalysisJobMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
}