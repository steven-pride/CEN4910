"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (updates: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) (v ? sp.set(k, v) : sp.delete(k));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };
}

export function MeterSearch({ defaultValue }: { defaultValue: string }) {
  const setUrl = useUrlState();
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        defaultValue={defaultValue}
        placeholder="Filter meter ID or zone..."
        aria-label="Filter meters"
        className="w-64 pl-8"
        onKeyDown={(e) => {
          if (e.key === "Enter") setUrl({ q: e.currentTarget.value, page: "1" });
        }}
      />
    </div>
  );
}

export function MeterPagination({ total, page, pageSize = 3 }: { total: number; page: number; pageSize?: number }) {
  const setUrl = useUrlState();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const shown = Math.min(pageSize, Math.max(0, total - (page - 1) * pageSize));

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        Showing {shown} of {total} Registered Building Telemetry Meters
      </p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setUrl({ page: String(page - 1) })}>
          Previous
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "ghost"}
            aria-current={p === page ? "page" : undefined}
            onClick={() => setUrl({ page: String(p) })}
          >
            {p}
          </Button>
        ))}
        <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => setUrl({ page: String(page + 1) })}>
          Next
        </Button>
      </div>
    </div>
  );
}
