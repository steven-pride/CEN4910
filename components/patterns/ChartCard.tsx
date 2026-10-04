import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

type ChartCardProps = {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function ChartCard({ eyebrow, title, aside, footer, className, children }: ChartCardProps) {
  return (
    <Card className={cn("bg-muted/40", className)}>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          {aside}
        </div>
        <div className="flex-1">{children}</div>
        {footer && (
          <div className="rounded-md bg-brand-cyan/30 py-2 text-center text-sm font-semibold text-brand-teal">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
