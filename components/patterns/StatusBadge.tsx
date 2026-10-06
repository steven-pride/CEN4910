import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_TONES = ["verified", "audited", "electric", "gas", "water"] as const;

const statusBadgeVariants = cva("rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      verified: "bg-success/15 text-success",
      audited: "bg-muted text-muted-foreground",
      electric: "bg-primary/10 text-primary",
      gas: "bg-muted text-foreground",
      water: "bg-brand-cyan/25 text-brand-teal",
    },
  },
  defaultVariants: { tone: "audited" },
});

export function StatusBadge({
  tone,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "variant"> & VariantProps<typeof statusBadgeVariants>) {
  return <Badge variant="secondary" className={cn(statusBadgeVariants({ tone }), className)} {...props} />;
}
