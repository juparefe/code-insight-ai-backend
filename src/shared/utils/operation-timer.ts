export interface OperationTimerOptions {
  /**
   * Prefix that groups the log line in CloudWatch, e.g. `[ANALYSIS]`.
   * Defaults to `ANALYSIS`.
   */
  namespace?: string;
}

/**
 * Measures how long an operation takes and emits a CloudWatch-friendly log
 * line when {@link OperationTimer.end} is called:
 *
 * ```
 * [ANALYSIS] Repository fetch completed
 * durationMs=8421
 * ```
 *
 * The `key=value` pairs on the message make it trivial to build metric
 * filters or query the duration in CloudWatch Logs Insights.
 */
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
