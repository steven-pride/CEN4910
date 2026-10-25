"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "12m", label: "Trailing 12 Months" },
  { value: "ytd", label: "YTD Comparison" },
] as const;

export function RangeToggle({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function select(next: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("range", next);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Date range">
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          size="sm"
          variant={value === o.value ? "secondary" : "ghost"}
          aria-pressed={value === o.value}
          onClick={() => select(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
