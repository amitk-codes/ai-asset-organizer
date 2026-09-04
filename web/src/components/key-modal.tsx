"use client";

import { Copy, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function KeyModal({ keyValue, onClose }: { keyValue: string | null; onClose: () => void }) {
  if (!keyValue) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="spotlight-anim relative w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Your new key</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Save this — it&apos;s the only way back into your workspace.
        </p>
        <code className="mt-4 block break-all rounded-2xl bg-muted px-4 py-4 text-sm font-bold clay-inset">
          {keyValue}
        </code>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            navigator.clipboard.writeText(keyValue);
            toast.success("Key copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy key
        </Button>
      </div>
    </div>
  );
}
