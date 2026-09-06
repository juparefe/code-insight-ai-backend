import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import type { AnalysisJob } from "../../domain/analysis-job.js";
import type { AnalysisJobRepository } from "../../application/ports/analysis-job-repository.js";

export class DynamoDbAnalysisJobRepository implements AnalysisJobRepository {
  private readonly documentClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client: DynamoDBClient,
  ) {
    this.documentClient = DynamoDBDocumentClient.from(client);
  }

  async create(job: AnalysisJob): Promise<void> {
    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: job,
      }),
    );
  }

  async findById(id: string): Promise<AnalysisJob | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          id,
        },
      }),
    );

    return (result.Item as AnalysisJob | undefined) ?? null;
  }

  async update(job: AnalysisJob): Promise<void> {
    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: job,
      }),
    );
  }
}
