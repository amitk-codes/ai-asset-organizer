"use client";

import * as React from "react";
import { Check, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { createShare } from "@/lib/api";

export function ShareButton({
  targetType,
  targetId,
}: {
  targetType: "folder" | "asset";
  targetId: string;
}) {
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");

  async function share() {
    setState("loading");
    try {
      const created = await createShare(targetType, targetId);
      const url = `${window.location.origin}/share/${created.id}`;
      await navigator.clipboard.writeText(url);
      setState("done");
      toast.success("Share link copied to clipboard");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
      toast.error("Couldn't create a share link.");
    }
  }

  return (
    <button
      onClick={share}
      aria-label="Share"
      className="focus-ring shrink-0 rounded-lg text-muted-foreground transition-colors hover:text-foreground"
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  );
}
