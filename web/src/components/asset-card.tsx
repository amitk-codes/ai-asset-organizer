"use client";

import * as React from "react";
import { File, FileText, Image as ImageIcon } from "lucide-react";

import { type Asset } from "@/lib/api";
import { fileKind, typeMeta } from "@/lib/file-types";
import { ShareButton } from "@/components/share-button";
import { cn } from "@/lib/utils";

export function AssetCard({
  asset,
  onOpen,
  highlighted,
}: {
  asset: Asset;
  onOpen: () => void;
  highlighted?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const kind = fileKind(asset.mime_type);
  const meta = typeMeta[kind];
  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : File;

  React.useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  return (
    <div
      ref={ref}
      onClick={onOpen}
      className={cn(
        "group cursor-pointer rounded-3xl bg-card p-3.5 transition clay clay-hover",
        highlighted && "highlight-glow",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted clay-inset">
        {kind === "image" && asset.url ? (
          // signed URL from a private bucket; plain img avoids next/image domain config
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon
              className={kind === "pdf" ? "h-12 w-12 text-red-400" : "h-12 w-12 text-emerald-400"}
              strokeWidth={1.75}
            />
          </div>
        )}
      </div>

      <div className="px-1.5 pb-1 pt-3.5">
        <span
          className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold ${meta.tint}`}
        >
          {meta.label}
        </span>
        <div className="mt-2 flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-[15px] font-extrabold">{asset.filename}</p>
          <span onClick={(e) => e.stopPropagation()}>
            <ShareButton targetType="asset" targetId={asset.id} />
          </span>
        </div>
        {asset.content_text && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{asset.content_text}</p>
        )}
      </div>
    </div>
  );
}
