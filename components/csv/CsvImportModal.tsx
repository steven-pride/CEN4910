"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { parseCsv } from "@/lib/csv/parser";

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "properties" | "meters" | "readings";
  title?: string;
  propertyContext?: { id: number | string; name: string };
  onSuccess?: () => void;
}

interface JobStatusResponse {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  processedRows: number;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors?: { row: number; column: string; message: string }[];
  errorReportUrl?: string;
}

export function CsvImportModal({
  isOpen,
  onClose,
  type,
  title,
  propertyContext,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setFile(null);
    setPreviewHeaders([]);
    setPreviewRows([]);
    setIsSubmitting(false);
    setJobId(null);
    setJobStatus(null);
    setErrorMessage(null);
    onClose();
  };

  // Poll for job status
  useEffect(() => {
    if (!jobId || !isOpen) return;

    let isPolling = true;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/import/jobs/${jobId}`);
        if (!res.ok) return;
        const data: JobStatusResponse = await res.json();

        if (isPolling) {
          setJobStatus(data);
          if (data.status === "completed" || data.status === "failed") {
            setIsSubmitting(false);
            if (data.status === "completed" && onSuccess) {
              onSuccess();
            }
          } else {
            setTimeout(pollStatus, 1500);
          }
        }
      } catch {
        if (isPolling) {
          setTimeout(pollStatus, 2000);
        }
      }
    };

    pollStatus();

    return () => {
      isPolling = false;
    };
  }, [jobId, isOpen, onSuccess]);

  if (!isOpen) return null;

  const entityLabel =
    type === "properties"
      ? "Properties"
      : type === "meters"
      ? "Meters"
      : "Meter Readings";

  const modalTitle =
    title ||
    (propertyContext
      ? `Bulk Import ${entityLabel} for ${propertyContext.name}`
      : `Bulk Import ${entityLabel}`);

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please select a valid .csv file.");
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseCsv(text);
        setPreviewHeaders(parsed.headers);
        setPreviewRows(parsed.rows.slice(0, 5));
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyContext?.id) {
        formData.append("property_id", String(propertyContext.id));
      }

      const endpoint = `/api/import/${type}`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to submit import job.");
        setIsSubmitting(false);
        return;
      }

      setJobId(data.jobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting file";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
            <p className="text-xs text-slate-500">
              Upload a standard CSV file to ingest records asynchronously.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Template Download Link */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50/70 px-4 py-2.5 text-xs text-blue-900">
            <span>Need the official formatting structure?</span>
            <a
              href={`/api/import/templates/${type}`}
              download={`${type}-template.csv`}
              className="flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 underline"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Download Sample CSV
            </a>
          </div>

          {/* Upload File Selector (only when not processing/completed) */}
          {!jobId && (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Preview Table */}
              {previewRows.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      File Preview (First {previewRows.length} Rows):
                    </span>
                    <span className="text-xs text-slate-400">
                      {previewHeaders.length} columns detected
                    </span>
                  </div>
                  <div className="max-h-36 overflow-auto rounded-lg border border-slate-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          {previewHeaders.map((header) => (
                            <th key={header} className="px-2.5 py-1.5 font-bold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {previewHeaders.map((header) => (
                              <td key={header} className="px-2.5 py-1.5 whitespace-nowrap">
                                {row[header] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job In-Progress / Polling View */}
          {jobId && jobStatus && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {jobStatus.status === "completed" ? (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  ) : jobStatus.status === "failed" ? (
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                  ) : (
                    <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {jobStatus.status === "completed"
                        ? "Import Completed"
                        : jobStatus.status === "failed"
                        ? "Import Failed or Had Errors"
                        : "Processing Import In Background..."}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {jobStatus.status === "completed"
                        ? `Successfully ingested ${jobStatus.importedCount} of ${jobStatus.totalRows} records.`
                        : jobStatus.status === "failed"
                        ? `Processed ${jobStatus.processedRows} records with ${jobStatus.failedCount} errors.`
                        : `Processed ${jobStatus.processedRows} of ${jobStatus.totalRows || "?"} rows...`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {jobStatus.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    jobStatus.status === "completed"
                      ? "bg-emerald-500"
                      : jobStatus.status === "failed"
                      ? "bg-red-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>

              {/* Error Report Download if errors exist */}
              {jobStatus.errorReportUrl && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <div>
                    <span className="font-bold">Errors occurred during ingestion.</span>
                    <p>{jobStatus.failedCount} rows failed schema or reference checks.</p>
                  </div>
                  <a
                    href={jobStatus.errorReportUrl}
                    download={`import-errors-${jobStatus.jobId}.csv`}
                    className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-red-700"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Download Error Report
                  </a>
                </div>
              )}
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            {jobStatus?.status === "completed" ? "Done" : "Cancel"}
          </button>

          {!jobId && (
            <button
              type="button"
              disabled={!file || isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Start Ingestion"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CsvImportModal;
