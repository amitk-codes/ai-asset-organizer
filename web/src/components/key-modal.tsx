"use client";

import { Copy, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

export function KeyModal({ keyValue, onClose }: { keyValue: string | null; onClose: () => void }) {
  return (
    <Dialog open={keyValue !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        title="Your new key"
        description="Save this — it's the only way back into your workspace."
        className="max-w-sm rounded-3xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Your new key</h3>
          <DialogClose
            aria-label="Close"
            className="focus-ring rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </DialogClose>
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
            if (keyValue) {
              navigator.clipboard.writeText(keyValue);
              toast.success("Key copied");
            }
          }}
        >
          <Copy className="h-4 w-4" /> Copy key
        </Button>
      </DialogContent>
    </Dialog>
  );
}
