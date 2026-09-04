"use client";

import { X } from "lucide-react";

import { type Asset } from "@/lib/api";
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
  if (!open) return null;

  const unorganizedCount = assets.filter((a) => !a.folder_id).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Upload files</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
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
      </div>
    </div>
  );
}
