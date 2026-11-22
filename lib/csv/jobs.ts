/**
 * Background Import Job Manager.
 * Stores job state, progress metrics, and error collections.
 */

import type { RowValidationError } from "./validation";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface ImportJob {
  jobId: string;
  type: "properties" | "meters" | "readings";
  status: JobStatus;
  progress: number;
  totalRows: number;
  processedRows: number;
  importedCount: number;
  failedCount: number;
  errorCount: number;
  errors: RowValidationError[];
  errorReportId?: string;
  errorReportUrl?: string;
  userId?: string;
  createdAt: number;
  updatedAt: number;
}

declare global {
  var __importJobs: Map<string, ImportJob> | undefined;
}

const jobStore: Map<string, ImportJob> =
  globalThis.__importJobs || (globalThis.__importJobs = new Map());

/**
 * Creates and registers a new import job.
 */
export function createImportJob(
  jobId: string,
  type: "properties" | "meters" | "readings",
  userId?: string
): ImportJob {
  const job: ImportJob = {
    jobId,
    type,
    status: "queued",
    progress: 0,
    totalRows: 0,
    processedRows: 0,
    importedCount: 0,
    failedCount: 0,
    errorCount: 0,
    errors: [],
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  jobStore.set(jobId, job);
  console.info("[CSV import] job queued", { jobId, type, status: job.status });
  return job;
}

/**
 * Retrieves an import job by ID.
 */
export function getImportJob(jobId: string): ImportJob | null {
  return jobStore.get(jobId) || null;
}

/**
 * Updates an import job's status and progress.
 */
export function updateImportJob(
  jobId: string,
  updates: Partial<Omit<ImportJob, "jobId" | "createdAt">>
): ImportJob | null {
  const job = jobStore.get(jobId);
  if (!job) return null;

  Object.assign(job, updates, { updatedAt: Date.now() });
  const details = {
    jobId,
    type: job.type,
    status: job.status,
    progress: job.progress,
    totalRows: job.totalRows,
    processedRows: job.processedRows,
    importedCount: job.importedCount,
    failedCount: job.failedCount,
    errorCount: job.errorCount,
    errors: updates.errors?.map(({ row, column }) => ({ row, column })),
  };
  if (job.status === "failed" || job.failedCount > 0) {
    console.warn("[CSV import] job update", details);
  } else {
    console.info("[CSV import] job update", details);
  }
  return job;
}
