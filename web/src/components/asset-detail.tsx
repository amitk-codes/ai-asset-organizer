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
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="slide-in-right relative flex h-full w-full max-w-md flex-col bg-background">
        <div className="flex items-center justify-between gap-3 p-5">
          <h3 className="min-w-0 truncate text-lg font-extrabold">{asset.filename}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-5">
          <div className="overflow-hidden rounded-3xl bg-muted clay-inset">
            {isImage && asset.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.filename} className="max-h-72 w-full object-contain" />
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
              <p className="text-[15px] leading-relaxed">{asset.content_text}</p>
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
                className="rounded-xl bg-card px-3 py-2 text-sm font-bold text-foreground outline-none clay-inset"
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
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Open <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <ShareButton targetType="asset" targetId={asset.id} />
          <button
            onClick={handleDelete}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold transition-shadow clay-sm clay-press",
              confirming ? "bg-red-500 text-white" : "bg-card text-red-500",
            )}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} /> {confirming ? "Confirm?" : "Delete"}
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
