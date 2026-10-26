import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva("font-display font-bold uppercase", {
  variants: {
    size: {
      sm: "text-2xl tracking-tight",
      md: "text-4xl tracking-tight",
      lg: "text-5xl tracking-tight",
    },
  },
});

export function heading({
  size,
  className,
}: VariantProps<typeof headingVariants> & { className?: string } = {}) {
  return cn(headingVariants({ size }), className);
}
