import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Heading } from "@/app/ui/Heading";

type PageHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ backHref, backLabel, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="size-4" /> {backLabel}
        </Link>
        <Heading level={1} className="text-3xl lg:text-3xl">{title}</Heading>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
