"use client";

import { Fragment, useState, type ComponentProps } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/property/components/StatusBadge";
import { ReadingsPanel } from "@/app/property/components/meters/ReadingsPanel";
import type { MeterItem } from "@/lib/api/property-data";

type Tone = ComponentProps<typeof StatusBadge>["tone"];

// Maps meter.meter_type text to a StatusBadge tone.
// Adjust the returned values to the tones StatusBadge actually supports.
function typeTone(type: string | null): Tone {
  const t = (type ?? "").toLowerCase();
  if (/water|sewer|irrigation/.test(t)) return "water" as Tone;
  if (/gas/.test(t)) return "gas" as Tone;
  if (/electric|energy|solar/.test(t)) return "electric" as Tone;
  return "water" as Tone;
}

function formatDate(value: string | null) {
  return value ?? "—";
}

export function MeterTable({ meters }: { meters: MeterItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Meter ID / Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Latest Reading</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meters.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
              No meters found for this property.
            </TableCell>
          </TableRow>
        )}

        {meters.map((m) => {
          const open = openId === m.meterId;

          return (
            <Fragment key={m.meterId}>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Meter #{m.meterId}</div>
                  <div className="text-sm text-muted-foreground">{m.name}</div>
                </TableCell>

                <TableCell>
                  <StatusBadge tone={typeTone(m.type)}>{m.type ?? "Unspecified"}</StatusBadge>
                </TableCell>

                <TableCell>
                  {m.lastReading ? (
                    <>
                      <div className="font-medium tabular-nums">
                        {m.lastReading.usage.toLocaleString("en-US")} {m.lastReading.unit ?? ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ended {formatDate(m.lastReading.endDate)}
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No readings yet</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {/* Read-only: status comes from active_date / inactive_date */}
                    <Switch
                      checked={m.status === "active"}
                      disabled
                      aria-label={`Meter ${m.meterId} ${m.status}`}
                    />
                    <span className="capitalize">{m.status}</span>
                  </div>
                  {(m.activeDate || m.inactiveDate) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(m.activeDate)} → {formatDate(m.inactiveDate)}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={open ? "default" : "secondary"}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : m.meterId)}
                  >
                    {open ? "Collapse" : "Expand"} Readings
                    {open ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </TableCell>
              </TableRow>

              {open && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="bg-muted/40 p-4">
                    <ReadingsPanel
                      meterId={m.meterId}
                      meterName={m.name}
                      meterType={m.type}
                    />
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