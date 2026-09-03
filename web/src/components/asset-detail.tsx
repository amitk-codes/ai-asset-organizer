"use client";

import * as React from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteAsset, moveAsset, type Asset, type Folder } from "@/lib/api";
import { ShareButton } from "@/components/share-button";
import { buttonVariants } from "@/components/ui/button";
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
  const [folderId, setFolderId] = React.useState<string | null>(asset?.folder_id ?? null);
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    setFolderId(asset?.folder_id ?? null);
    setConfirming(false);
  }, [asset]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!asset) return null;

  const current = asset;
  const isImage = current.mime_type?.startsWith("image/");

  async function handleMove(next: string | null) {
    setFolderId(next);
    try {
      await moveAsset(current.id, next);
      toast.success(next ? "Moved to folder" : "Removed from folder");
      onMoved();
    } catch {
      toast.error("Couldn't move the file.");
      setFolderId(current.folder_id ?? null);
    }
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    try {
      await deleteAsset(current.id);
      toast.success("Deleted");
      onDeleted();
    } catch {
      toast.error("Couldn't delete the file.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <h3 className="min-w-0 truncate font-semibold">{asset.filename}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            {isImage && asset.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.filename} className="max-h-72 w-full object-contain" />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                {asset.mime_type ?? "file"}
              </div>
            )}
          </div>

          {asset.content_text && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                What this is
              </p>
              <p className="text-sm leading-relaxed">{asset.content_text}</p>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <Meta label="Type" value={asset.mime_type ?? "—"} />
            <Meta label="Size" value={formatSize(asset.size_bytes)} />
            <Meta label="Added" value={new Date(asset.created_at).toLocaleDateString()} />
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Folder</span>
              <select
                value={folderId ?? ""}
                onChange={(e) => handleMove(e.target.value || null)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
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

        <div className="flex items-center gap-3 border-t border-border p-4">
          {asset.url && (
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              Open <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <ShareButton targetType="asset" targetId={asset.id} />
          <button
            onClick={handleDelete}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
              confirming
                ? "bg-red-500/10 text-red-500"
                : "text-muted-foreground hover:text-red-500",
            )}
          >
            <Trash2 className="h-4 w-4" /> {confirming ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
