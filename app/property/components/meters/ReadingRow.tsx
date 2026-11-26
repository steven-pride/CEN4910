"use client";

import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Reading } from "@/lib/types/readings";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ReadingRow({ reading }: { reading: Reading }) {
  const dateLabel = reading.endDate
    ? `${reading.startDate} → ${reading.endDate}`
    : reading.startDate;

  return (
    <TableRow>
      <TableCell className="font-medium">{dateLabel}</TableCell>
      <TableCell className="tabular-nums">{reading.usage}</TableCell>
      <TableCell>{reading.unit ?? "—"}</TableCell>
      <TableCell className="tabular-nums">
        {reading.cost !== null ? usd.format(reading.cost) : "—"}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button size="sm">
            <Link href={`/reading/${reading.meterReadingId}/edit`}>Edit</Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}