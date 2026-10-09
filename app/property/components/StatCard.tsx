import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from '@/app/ui/Heading';

export const STAT_CARD_TONES = ["solid", "cyan", "teal"] as const;

const statCardVariants = cva("overflow-hidden", {
  variants: {
    tone: {
      solid: "border-transparent bg-primary text-primary-foreground",
      cyan: "border-t-4 border-t-brand-cyan",
      teal: "border-t-4 border-t-brand-teal",
    },
  },
  defaultVariants: { tone: "cyan" },
});

type StatCardProps = VariantProps<typeof statCardVariants> & {
  eyebrow: string;
  title: string;
  value: string;
  unit?: string;
  trend?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function StatCard({ tone, eyebrow, title, value, unit, trend, icon, className }: StatCardProps) {
  return (
    <Card className={cn(statCardVariants({ tone }), className)}>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Eyebrow className={cn(tone === "solid" && "text-primary-foreground/80")}>{eyebrow}</Eyebrow>
            <Heading level={3} className="text-base font-medium">{title}</Heading>
          </div>
          {icon}
        </div>
        <p className="flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-sm">{unit}</span>}
          {trend && <span className="text-xs font-medium text-success">{trend}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
