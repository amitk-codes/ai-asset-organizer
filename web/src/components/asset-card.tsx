import { File, FileText } from "lucide-react";

import { type Asset } from "@/lib/api";
import { ShareButton } from "@/components/share-button";

export function AssetCard({ asset }: { asset: Asset }) {
  const isImage = asset.mime_type?.startsWith("image/");

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {isImage && asset.url ? (
          // signed URL from a private bucket; plain img avoids next/image domain config
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.filename}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <FilePreview mime={asset.mime_type} />
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{asset.filename}</p>
          <ShareButton targetType="asset" targetId={asset.id} />
        </div>
        {asset.content_text && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asset.content_text}</p>
        )}
      </div>
    </div>
  );
}

function FilePreview({ mime }: { mime: string | null }) {
  const Icon = mime === "application/pdf" ? FileText : File;
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
  );
}
