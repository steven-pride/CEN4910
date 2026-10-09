"use client";

import { Plus } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReadingRow } from "@/app/property/components/meters/ReadingRow";
import type { Meter } from "@/data/mockMeters";
import { Heading } from '@/app/ui/Heading';

export function ReadingsPanel({ meter }: { meter: Meter }) {
  return (
    <div className="space-y-3">
      <Heading level={6}>
        Telemetry Readings Log for Meter #{meter.code} ({meter.typeLabel})
      </Heading>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reading Date</TableHead>
            <TableHead>Usage Quantity (Editable)</TableHead>
            <TableHead>Quantity Unit</TableHead>
            <TableHead>Billed Cost ($)</TableHead>
            <TableHead>Audit Status</TableHead>
            <TableHead className="text-right">Row Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meter.readings.map((r) => (
            <ReadingRow key={r.id} reading={r} />
          ))}
        </TableBody>
      </Table>
      <Button size="sm">
        <Plus /> Add Meter Reading
      </Button>
    </div>
  );
}
