import { pollJob } from "@/lib/utils/polling";

/**
 * Client-Side Asynchronous Export Polling and Download Helper.
 * Triggers export generation, polls job status, and initiates browser download.
 */

export async function triggerAsyncExport(
  endpoint: string,
  body?: Record<string, unknown>,
  onProgress?: (progress: number) => void
): Promise<void> {
  // 1. Submit export trigger request
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to trigger export: ${response.statusText}`);
  }

  const initData = await response.json();
  const exportId = initData.exportId;
  const statusUrl = initData.statusUrl || `/api/exports/jobs/${exportId}`;

  // 2. Poll until export completes or fails (up to 5 minutes)
  const jobData = await pollJob(statusUrl, {
    intervalMs: 500,
    maxAttempts: 600, // 5 minutes max (300 seconds at 500ms interval)
    onUpdate: (data) => {
      if (onProgress && typeof data.progress === "number") {
        onProgress(data.progress);
      }
    },
  });

  if (jobData.status === "failed") {
    throw new Error(jobData.error || "Export generation failed");
  }

  const downloadUrl = (jobData.downloadUrl as string) || `/api/exports/${exportId}`;
  const filename = (jobData.filename as string) || `export-${exportId}.csv`;

  // 3. Initiate browser download
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
