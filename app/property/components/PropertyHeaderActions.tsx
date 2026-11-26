"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FilePen, FileUp } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CsvImportModal from "@/components/csv/CsvImportModal";
import { triggerAsyncExport } from "@/lib/utils/download";

export interface PropertyHeaderActionsProps {
  propertyId: string | number;
  propertyName: string;
}

export function PropertyHeaderActions({
  propertyId,
  propertyName,
}: PropertyHeaderActionsProps) {
  const router = useRouter();
  const [importType, setImportType] = useState<"meters" | "readings" | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleImportSuccess = () => {
    router.refresh();
  };

  const handleExportProperty = async () => {
    try {
      setIsExporting(true);
      await triggerAsyncExport("/api/exports/properties", {
        propertyId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      alert(`Export failed: ${msg}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setImportType("meters")}
      >
        <FileUp className="text-primary" />
        Bulk Import Meters
      </Button>

      <Button
        variant="outline"
        onClick={() => setImportType("readings")}
      >
        <FileUp className="text-primary" />
        Bulk Import Meter Readings
      </Button>

      <Button variant="teal" onClick={handleExportProperty} disabled={isExporting}>
        <Download className={isExporting ? "animate-bounce" : ""} />
        {isExporting ? "Exporting..." : "Export Property Data"}
      </Button>

      <Link
        href={`/property/${propertyId}/edit`}
        className={cn(buttonVariants(), "inline-flex items-center gap-2")}
      >
        <FilePen />
        Edit Data for Property
      </Link>

      {importType && (
        <CsvImportModal
          isOpen={true}
          type={importType}
          propertyContext={{ id: propertyId, name: propertyName }}
          onClose={() => setImportType(null)}
          onSuccess={handleImportSuccess}
        />
      )}
    </>
  );
}

export default PropertyHeaderActions;
