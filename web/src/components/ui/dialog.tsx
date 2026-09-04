"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

/**
 * Accessible dialog built on Radix: focus trap + return, body scroll-lock,
 * role/aria wiring, Escape + overlay-click close. Styled with the app's clay
 * language. Two shapes: a centered modal and a right-side drawer.
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

type Variant = "center" | "drawer" | "top";

const VARIANT_CLASS: Record<Variant, string> = {
  center:
    "spotlight-anim fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none",
  drawer: "slide-in-right fixed right-0 top-0 z-50 flex h-full w-full flex-col outline-none",
  top: "spotlight-anim fixed left-1/2 top-[14vh] z-[100] w-full -translate-x-1/2 px-4 outline-none",
};

export function DialogContent({
  variant = "center",
  title,
  description,
  className,
  overlayClassName,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  variant?: Variant;
  /** Accessible name (required by Radix for screen readers). */
  title: string;
  description?: string;
  overlayClassName?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className={cn("fade-in fixed inset-0 z-50 bg-black/40", overlayClassName)}
      />
      <RadixDialog.Content className={cn(VARIANT_CLASS[variant], className)} {...props}>
        <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="sr-only">{description}</RadixDialog.Description>
        ) : null}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
