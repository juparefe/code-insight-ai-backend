export class OperationTimer {
  private readonly startedAt = Date.now();

  constructor(
    private readonly operation: string,
  ) {
    console.log(`[TIMING] ${operation} started`);
  }

  end(metadata?: Record<string, unknown>): number {
    const durationMs = Date.now() - this.startedAt;

    console.log(
      `[TIMING] ${this.operation} completed`,
      JSON.stringify({
        durationMs,
        ...metadata,
      }),
    );

    return durationMs;
  }
}