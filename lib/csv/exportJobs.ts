/**
 * Background Export Job Store & Lifecycle Manager.
 * Stores job states and progress metrics in memory.
 */

export type ExportJobStatus = "queued" | "processing" | "completed" | "failed";

export interface ExportJob {
  exportId: string;
  type: string;
  status: ExportJobStatus;
  progress: number;
  downloadUrl?: string;
  filename?: string;
  rowCount?: number;
  error?: string;
  userId?: string;
  assignedPropertyIds?: number[];
  createdAt: number;
  updatedAt: number;
}

declare global {
  var __exportJobs: Map<string, ExportJob> | undefined;
}

const exportJobStore: Map<string, ExportJob> =
  globalThis.__exportJobs || (globalThis.__exportJobs = new Map());

/**
 * Creates and registers a new export job.
 */
export function createExportJob(
  exportId: string,
  type: string,
  userId?: string,
  assignedPropertyIds?: number[]
): ExportJob {
  const job: ExportJob = {
    exportId,
    type,
    status: "queued",
    progress: 0,
    userId,
    assignedPropertyIds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  exportJobStore.set(exportId, job);
  console.info("[CSV export] job queued", { exportId, type, status: job.status });
  return job;
}

/**
 * Retrieves an export job by ID.
 */
export function getExportJob(exportId: string): ExportJob | null {
  return exportJobStore.get(exportId) || null;
}

/**
 * Updates an export job's status, progress, or metadata.
 */
export function updateExportJob(
  exportId: string,
  updates: Partial<Omit<ExportJob, "exportId" | "createdAt">>
): ExportJob | null {
  const job = exportJobStore.get(exportId);
  if (!job) return null;

  Object.assign(job, updates, { updatedAt: Date.now() });
  const details = {
    exportId,
    type: job.type,
    status: job.status,
    progress: job.progress,
    rowCount: job.rowCount,
  };
  if (job.status === "failed") {
    console.warn("[CSV export] job failed; details are available in the job status", details);
  } else {
    console.info("[CSV export] job update", details);
  }
  return job;
}
