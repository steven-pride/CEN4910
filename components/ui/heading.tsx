import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const HEADING_LEVELS = [1, 2, 3, 4] as const;
type Level = (typeof HEADING_LEVELS)[number];

const headingVariants = cva("font-semibold tracking-tight text-foreground", {
  variants: {
    level: {
      1: "text-4xl lg:text-5xl",
      2: "text-2xl",
      3: "text-xl",
      4: "text-lg",
    },
  },
  defaultVariants: { level: 2 },
});

export function Heading({
  level = 2,
  className,
  ...props
}: React.ComponentProps<"h2"> & { level?: Level }) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(headingVariants({ level }), className)} {...props} />;
}
