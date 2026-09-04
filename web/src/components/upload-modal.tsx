"use client";

import { X } from "lucide-react";

import { type Asset } from "@/lib/api";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { OrganizePanel } from "@/components/organize-panel";
import { Uploader } from "@/components/uploader";

export function UploadModal({
  open,
  onClose,
  onReload,
  assets,
}: {
  open: boolean;
  onClose: () => void;
  onReload: () => void;
  assets: Asset[];
}) {
  const unorganizedCount = assets.filter((a) => !a.folder_id).length;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        title="Upload files"
        className="max-w-2xl rounded-3xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Upload files</h3>
          <DialogClose
            aria-label="Close"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </DialogClose>
        </div>

        <div className="space-y-5">
          <Uploader onUploaded={onReload} />
          {unorganizedCount > 0 && (
            <OrganizePanel
              assets={assets}
              onApplied={() => {
                onReload();
                onClose();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
