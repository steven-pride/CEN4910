"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FilePen, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CsvImportModal from "@/components/csv/CsvImportModal";

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

  const handleImportSuccess = () => {
    router.refresh();
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

      <Button variant="teal">
        <Download /> Export Property Details
      </Button>

      <Button>
        <FilePen /> Edit Data for Property
      </Button>

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
