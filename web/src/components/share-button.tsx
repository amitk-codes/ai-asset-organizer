"use client";

import * as React from "react";
import { Clock, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { createShare } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const OPTIONS: { label: string; hours: number | null }[] = [
  { label: "1 hour", hours: 1 },
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 168 },
  { label: "30 days", hours: 720 },
  { label: "Never expires", hours: null },
];

export function ShareButton({
  targetType,
  targetId,
}: {
  targetType: "folder" | "asset";
  targetId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);

  async function share(label: string, hours: number | null) {
    setPending(label);
    try {
      const created = await createShare(targetType, targetId, { expiresInHours: hours });
      const url = `${window.location.origin}/share/${created.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
      setOpen(false);
    } catch {
      toast.error("Couldn't create a share link.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Share"
        className="focus-ring shrink-0 rounded-lg text-muted-foreground transition-colors hover:text-foreground"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={(next) => !next && !pending && setOpen(false)}>
        <DialogContent
          title="Create a share link"
          description="Choose when the link should expire."
          className="max-w-xs rounded-3xl bg-card p-5 shadow-2xl"
        >
          <h3 className="text-base font-extrabold">Share link</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Link copies to clipboard · pick an expiry
          </p>
          <div className="mt-4 space-y-2">
            {OPTIONS.map((o) => (
              <button
                key={o.label}
                onClick={() => share(o.label, o.hours)}
                disabled={pending !== null}
                className={cn(
                  "focus-ring flex w-full items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-bold transition-shadow clay-inset disabled:opacity-60",
                  o.hours === null && "text-primary",
                )}
              >
                {o.label}
                {pending === o.label && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
