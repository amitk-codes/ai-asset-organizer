"use client";

import * as React from "react";
import { ExternalLink, X } from "lucide-react";

import { type Asset, type Folder } from "@/lib/api";
import { ShareButton } from "@/components/share-button";
import { buttonVariants } from "@/components/ui/button";

export function AssetDetail({
  asset,
  folders,
  onClose,
}: {
  asset: Asset | null;
  folders: Folder[];
  onClose: () => void;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!asset) return null;

  const isImage = asset.mime_type?.startsWith("image/");
  const folder = folders.find((f) => f.id === asset.folder_id);

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

          <div className="space-y-2 text-sm">
            <Meta label="Type" value={asset.mime_type ?? "—"} />
            <Meta label="Size" value={formatSize(asset.size_bytes)} />
            <Meta label="Folder" value={folder?.name ?? "Unorganized"} />
            <Meta label="Added" value={new Date(asset.created_at).toLocaleDateString()} />
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
