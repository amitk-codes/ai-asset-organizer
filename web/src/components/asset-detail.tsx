"use client";

import * as React from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteAsset, moveAsset, type Asset, type Folder } from "@/lib/api";
import { Markdown } from "@/components/markdown";
import { ShareButton } from "@/components/share-button";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AssetDetail({
  asset,
  folders,
  onClose,
  onMoved,
  onDeleted,
}: {
  asset: Asset | null;
  folders: Folder[];
  onClose: () => void;
  onMoved: () => void;
  onDeleted: () => void;
}) {
  return (
    <Dialog open={asset !== null} onOpenChange={(next) => !next && onClose()}>
      {asset && (
        <DialogContent variant="drawer" title={asset.filename} className="max-w-md bg-background">
          {/* keyed so switching assets re-initialises local state without an effect */}
          <DetailBody
            key={asset.id}
            asset={asset}
            folders={folders}
            onClose={onClose}
            onMoved={onMoved}
            onDeleted={onDeleted}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

function DetailBody({
  asset,
  folders,
  onClose,
  onMoved,
  onDeleted,
}: {
  asset: Asset;
  folders: Folder[];
  onClose: () => void;
  onMoved: () => void;
  onDeleted: () => void;
}) {
  const [folderId, setFolderId] = React.useState<string | null>(asset.folder_id ?? null);
  const [confirming, setConfirming] = React.useState(false);

  const isImage = asset.mime_type?.startsWith("image/");

  async function handleMove(next: string | null) {
    setFolderId(next);
    try {
      await moveAsset(asset.id, next);
      toast.success(next ? "Moved to folder" : "Removed from folder");
      onMoved();
    } catch {
      toast.error("Couldn't move the file.");
      setFolderId(asset.folder_id ?? null);
    }
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    try {
      await deleteAsset(asset.id);
      toast.success("Deleted");
      onDeleted();
    } catch {
      toast.error("Couldn't delete the file.");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-5">
        <h3 className="min-w-0 truncate text-lg font-extrabold">{asset.filename}</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-5">
        <div className="overflow-hidden rounded-3xl bg-muted clay-inset">
          {isImage && asset.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.url}
              alt={asset.filename}
              loading="lazy"
              decoding="async"
              className="max-h-72 w-full object-contain"
            />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm font-semibold text-muted-foreground">
              {asset.mime_type ?? "file"}
            </div>
          )}
        </div>

        {asset.content_text && (
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              What this is
            </p>
            <Markdown text={asset.content_text} className="text-[15px] leading-relaxed" />
          </div>
        )}

        <div className="space-y-3.5 text-[15px]">
          <Meta label="Type" value={asset.mime_type ?? "—"} />
          <Meta label="Size" value={formatSize(asset.size_bytes)} />
          <Meta label="Added" value={new Date(asset.created_at).toLocaleDateString()} />
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Folder</span>
            <select
              value={folderId ?? ""}
              onChange={(e) => handleMove(e.target.value || null)}
              aria-label="Move to folder"
              className="focus-ring rounded-xl bg-card px-3 py-2 text-sm font-bold text-foreground outline-none clay-inset"
            >
              <option value="">Unorganized</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-5">
        {asset.url && (
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "focus-ring")}
          >
            Open <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <ShareButton targetType="asset" targetId={asset.id} />
        <button
          onClick={handleDelete}
          className={cn(
            "focus-ring ml-auto flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold transition-shadow clay-sm clay-press",
            confirming ? "bg-red-500 text-white" : "bg-card text-red-500",
          )}
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.5} /> {confirming ? "Confirm?" : "Delete"}
        </button>
      </div>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-bold">{value}</span>
    </div>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
