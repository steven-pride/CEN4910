/**
 * Background Import Job Manager.
 * Stores job state, progress metrics, and error collections.
 */

import { RowValidationError } from "./validation";

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
    errors: [],
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  jobStore.set(jobId, job);
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
  return job;
}
