"use client";

import { useState, useTransition } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/property/components/StatusBadge";
import { deleteReading, updateReading } from "@/app/property/components/meters/Actions";
import type { Reading } from "@/data/mockReadings";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ReadingRow({ reading }: { reading: Reading }) {
  const [qty, setQty] = useState(String(reading.quantity));
  const [pending, start] = useTransition();
  const dirty = Number(qty) !== reading.quantity;

  return (
    <TableRow>
      <TableCell className="font-medium">{reading.date}</TableCell>
      <TableCell>
        <Input
          inputMode="decimal"
          value={qty}
          aria-label={`Usage for ${reading.date}`}
          onChange={(e) => setQty(e.target.value)}
          className="border-transparent bg-muted text-right tabular-nums"
        />
      </TableCell>
      <TableCell>{reading.unit}</TableCell>
      <TableCell className="tabular-nums">{usd.format(reading.cost)}</TableCell>
      <TableCell>
        <StatusBadge tone={reading.audit} className="capitalize">{reading.audit}</StatusBadge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button size="sm" disabled={!dirty || pending} onClick={() => start(() => updateReading(reading.id, Number(qty)))}>
            Save
          </Button>
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => start(() => deleteReading(reading.id))}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
