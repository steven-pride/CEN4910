/**
 * Generic Job Polling Utility.
 * Periodically polls a status URL until the job reaches a terminal state (completed/failed) or times out.
 */

export interface PollJobOptions<T> {
  intervalMs?: number;
  maxAttempts?: number;
  onUpdate?: (data: T) => void;
  shouldStop?: (data: T) => boolean;
}

export type BaseJobStatus = {
  status: string;
  progress?: number;
  error?: string;
  [key: string]: any;
};

/**
 * Polls a job status URL until completion, failure, or timeout.
 */
export async function pollJob<T extends { status: string } = BaseJobStatus>(
  statusUrl: string,
  options: PollJobOptions<T> = {}
): Promise<T> {
  const intervalMs = options.intervalMs ?? 1000;
  const maxAttempts = options.maxAttempts ?? 300; // 5 minutes at 1s interval by default
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;

    const res = await fetch(statusUrl);
    if (!res.ok) {
      continue;
    }

    const data: T = await res.json();
    if (options.onUpdate) {
      options.onUpdate(data);
    }

    const isFinished = options.shouldStop
      ? options.shouldStop(data)
      : data.status === "completed" || data.status === "failed";

    if (isFinished) {
      return data;
    }
  }

  throw new Error("Job timed out. Please try again.");
}
