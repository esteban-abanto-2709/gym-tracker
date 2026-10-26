import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      variant: {
        brand:
          "bg-linear-to-r from-brand-start to-brand-end text-primary-foreground",
        muted:
          "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-primary",
        danger:
          "bg-muted/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        remove:
          "text-muted-foreground hover:bg-destructive/20 hover:text-destructive",
      },
      size: {
        xl: "w-full py-4 rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg",
        lg: "px-5 py-3 rounded-2xl font-display uppercase tracking-wide text-lg shadow-lg",
        md: "px-4 py-3 rounded-xl font-bold",
        icon: "p-2.5 rounded-xl",
        "icon-round": "p-2 rounded-full",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "xl",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
