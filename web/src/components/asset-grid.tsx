import { File, FileText, Image as ImageIcon } from "lucide-react";

import { type Asset } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";

function iconFor(mime: string | null) {
  if (mime?.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  return File;
}

export function AssetGrid({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No files yet. Upload something to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => {
        const Icon = iconFor(asset.mime_type);
        return (
          <Card key={asset.id} className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{asset.filename}</p>
              <p className="text-xs capitalize text-muted-foreground">{asset.status}</p>
            </div>
            <ShareButton targetType="asset" targetId={asset.id} />
          </Card>
        );
      })}
    </div>
  );
}
