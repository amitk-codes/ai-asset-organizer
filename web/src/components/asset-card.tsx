"use client";

import * as React from "react";
import { Check, File, FileText, Image as ImageIcon } from "lucide-react";

import { type Asset } from "@/lib/api";
import { fileKind, typeMeta } from "@/lib/file-types";
import { ShareButton } from "@/components/share-button";
import { cn, stripMarkdown } from "@/lib/utils";

export function AssetCard({
  asset,
  onOpen,
  highlighted,
  index = 0,
  selected = false,
  selectionActive = false,
  onToggleSelect,
}: {
  asset: Asset;
  onOpen: () => void;
  highlighted?: boolean;
  index?: number;
  selected?: boolean;
  selectionActive?: boolean;
  onToggleSelect?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const kind = fileKind(asset.mime_type);
  const meta = typeMeta[kind];
  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : File;
  const ext = asset.filename.includes(".")
    ? asset.filename.split(".").pop()!.toUpperCase()
    : "FILE";

  React.useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  return (
    <div
      ref={ref}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${asset.filename}`}
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
      className={cn(
        "focus-ring group fade-in-up relative cursor-pointer rounded-3xl bg-card p-3.5 transition clay clay-hover",
        highlighted && "highlight-glow",
        selected && "ring-2 ring-primary",
      )}
    >
      {onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          role="checkbox"
          aria-checked={selected}
          aria-label={selected ? "Deselect file" : "Select file"}
          className={cn(
            "focus-ring absolute left-5 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-lg border-2 transition",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/70 bg-black/20 text-transparent opacity-0 group-hover:opacity-100",
            selectionActive && "opacity-100",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted clay-inset">
        {kind === "image" && asset.url ? (
          // signed URL from a private bucket; plain img avoids next/image domain config
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.filename}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : asset.content_text ? (
          // paper preview: a snippet of the extracted text on a document-like page
          <div className="h-full w-full overflow-hidden bg-paper p-4 text-left">
            <p className="line-clamp-6 text-[10px] leading-relaxed text-paper-foreground">
              {stripMarkdown(asset.content_text)}
            </p>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icon className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-xs font-extrabold uppercase tracking-wide">{ext}</span>
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
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {stripMarkdown(asset.content_text)}
          </p>
        )}
      </div>
    </div>
  );
}
