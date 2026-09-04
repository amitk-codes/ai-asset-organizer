"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      richColors
      // keep toasts above the mobile bottom tab bar + safe area
      mobileOffset={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
    />
  );
}
