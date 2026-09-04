import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[15px] font-bold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-violet-500/40 hover:brightness-105 active:translate-y-px active:shadow-[inset_5px_5px_11px_rgba(0,0,0,0.45),inset_-5px_-5px_11px_rgba(255,255,255,0.2)]",
        outline: "bg-card text-foreground clay-sm clay-press",
        ghost: "text-muted-foreground hover:text-foreground",
        danger:
          "bg-red-500 text-white shadow-lg shadow-red-500/40 hover:brightness-105 active:translate-y-px active:shadow-[inset_5px_5px_11px_rgba(0,0,0,0.45),inset_-5px_-5px_11px_rgba(255,255,255,0.2)]",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
