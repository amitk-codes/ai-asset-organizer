"use client";

import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Couldn't load your files",
  description = "The server didn't respond. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-muted-foreground clay">
        <WifiOff className="h-7 w-7" strokeWidth={2} />
      </span>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-5 w-5" strokeWidth={2.5} /> Try again
        </Button>
      )}
    </div>
  );
}
