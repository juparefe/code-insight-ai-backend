export interface OperationTimerOptions {
  namespace?: string;
}

export class OperationTimer {
  private readonly startedAt = Date.now();
  private readonly namespace: string;

  constructor(
    private readonly label: string,
    options: OperationTimerOptions = {},
  ) {
    this.namespace = options.namespace ?? "ANALYSIS";
  }

  end(metadata?: Record<string, unknown>): number {
    const durationMs = Date.now() - this.startedAt;

    const extraPairs = metadata
      ? Object.entries(metadata).map(([key, value]) => `${key}=${value}`)
      : [];

    const lines = [
      `[${this.namespace}] ${this.label} completed`,
      [`durationMs=${durationMs}`, ...extraPairs].join(" "),
    ];

    console.log(lines.join("\n"));

    return durationMs;
  }
}
