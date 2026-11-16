"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReadingRow } from "@/app/property/components/meters/ReadingRow";
import { Heading } from "@/app/ui/Heading";
import type { Reading } from "@/lib/types/readings";
import { cn } from "@/lib/utils";

type Props = {
  meterId: number;
  meterName: string;
  meterType: string | null;
};

export function ReadingsPanel({ meterId, meterName, meterType }: Props) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`/api/meters/${meterId}/readings?limit=12`, {
        cache: "no-store",
      });
      const json = await response.json();

      if (!response.ok) throw new Error(json.error || "Unable to load readings.");

      setReadings(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load readings.");
    } finally {
      setLoading(false);
    }
  }, [meterId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-3">
      <Heading level={6}>
        Telemetry Readings Log for Meter #{meterId} ({meterType ?? "Unspecified"}) — {meterName}
      </Heading>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading readings…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reading Period</TableHead>
              <TableHead>Usage Quantity</TableHead>
              <TableHead>Quantity Unit</TableHead>
              <TableHead>Billed Cost ($)</TableHead>
              <TableHead className="text-right">Row Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  No readings recorded for this meter.
                </TableCell>
              </TableRow>
            )}

            {readings.map((r) => (
              <ReadingRow key={r.meterReadingId} reading={r} />
            ))}
          </TableBody>
        </Table>
      )}

      <Link
        href={`/reading/new?meterId=${meterId}`}
        className={cn(buttonVariants({ size: "sm" }), "inline-flex items-center gap-2")}
      >
        <Plus className="size-4 shrink-0" />
        Add Meter Reading
      </Link>
    </div>
  );
}