"use client";

import * as React from "react";
import { X } from "lucide-react";

import { type Asset } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OrganizePanel } from "@/components/organize-panel";
import { Uploader, type UploaderHandle } from "@/components/uploader";

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
  const uploaderRef = React.useRef<UploaderHandle>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmClose, setConfirmClose] = React.useState(false);

  const unorganizedCount = assets.filter((a) => !a.folder_id).length;

  // intercept every close trigger (X / Esc / overlay): block while uploading
  function requestClose() {
    if (busy) setConfirmClose(true);
    else onClose();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogContent title="Upload files" className="max-w-2xl rounded-3xl bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Upload files</h3>
            <button
              onClick={requestClose}
              aria-label="Close"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="space-y-5">
            <Uploader ref={uploaderRef} onUploaded={onReload} onBusyChange={setBusy} />
            {unorganizedCount > 0 && !busy && (
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

      <ConfirmDialog
        open={confirmClose}
        title="Uploads in progress"
        description="Closing now will cancel the uploads that haven't finished."
        confirmLabel="Cancel & close"
        onConfirm={() => {
          uploaderRef.current?.cancelAll();
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}
