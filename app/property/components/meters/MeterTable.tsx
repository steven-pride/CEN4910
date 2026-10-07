"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/property/components/StatusBadge";
import { ReadingsPanel } from "@/app/property/components/meters/ReadingsPanel";
import type { Meter } from "@/data/mockMeters";

export function MeterTable({ meters }: { meters: Meter[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Meter ID / Hardware</TableHead>
          <TableHead>Type &amp; Medium</TableHead>
          <TableHead>Physical Location / Zone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meters.map((m) => {
          const open = openId === m.id;
          return (
            <Fragment key={m.id}>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Meter #{m.code}</div>
                  <div className="text-sm text-muted-foreground">{m.hardware}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={m.type}>{m.typeLabel}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{m.zone}</div>
                  <div className="text-sm text-muted-foreground">{m.location}</div>
                </TableCell>
                <TableCell>
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <Switch defaultChecked={m.active} aria-label={`Meter ${m.code} active`} /> Active
                  </label>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={open ? "default" : "secondary"}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : m.id)}
                  >
                    {open ? "Collapse" : "Expand"} Readings
                    {open ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </TableCell>
              </TableRow>
              {open && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="bg-muted/40 p-4">
                    <ReadingsPanel meter={m} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
