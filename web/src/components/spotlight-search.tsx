"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { File, FileText, FolderOpen, Image as ImageIcon, Loader2, Search } from "lucide-react";

import { searchAssets, type Asset } from "@/lib/api";
import { fileKind } from "@/lib/file-types";

const MIN_SIMILARITY = 0.62; // tuned: relevant matches score 0.63+, noise stays below

type Match = { asset: Asset; score: number };

export function SpotlightSearch({
  assets,
  onOpenAsset,
  onShowInFolder,
}: {
  assets: Asset[];
  onOpenAsset: (asset: Asset) => void;
  onShowInFolder: (asset: Asset) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Match[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const byId = React.useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
  }, []);

  React.useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const raw = await searchAssets(q);
      const matched = raw
        .filter((r) => r.similarity >= MIN_SIMILARITY)
        .map((r) => ({ asset: byId.get(r.id), score: r.similarity }))
        .filter((m): m is Match => Boolean(m.asset));
      setResults(matched);
    } finally {
      setLoading(false);
    }
  }

  const overlay = (
    <div className="fixed inset-0 z-[100] flex justify-center px-4 pt-[14vh]">
      <div className="fade-in absolute inset-0 bg-black/50" onClick={close} />
      <div className="spotlight-anim relative h-fit w-full max-w-2xl">
        <form onSubmit={run} className="relative">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2.5}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) setResults(null);
            }}
            placeholder="Search your files by meaning…"
            className="w-full rounded-3xl bg-card py-5 pl-14 pr-14 text-lg font-bold shadow-2xl outline-none placeholder:font-semibold placeholder:text-muted-foreground"
          />
          {loading && (
            <Loader2 className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </form>

        {results && (
          <div className="mt-3 overflow-hidden rounded-3xl bg-card shadow-2xl">
            {results.length === 0 ? (
              <p className="p-6 text-center text-sm font-semibold text-muted-foreground">
                No strong matches. Try different words.
              </p>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {results.map(({ asset, score }) => (
                  <Result
                    key={asset.id}
                    asset={asset}
                    score={score}
                    onOpen={() => {
                      onOpenAsset(asset);
                      close();
                    }}
                    onShowInFolder={() => {
                      onShowInFolder(asset);
                      close();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-card px-5 py-3.5 text-left text-[15px] font-medium text-muted-foreground clay-inset"
      >
        <Search className="h-5 w-5" strokeWidth={2.5} />
        Search your files by meaning…
      </button>

      {open && typeof document !== "undefined" && createPortal(overlay, document.body)}
    </>
  );
}

function Result({
  asset,
  score,
  onOpen,
  onShowInFolder,
}: {
  asset: Asset;
  score: number;
  onOpen: () => void;
  onShowInFolder: () => void;
}) {
  const kind = fileKind(asset.mime_type);
  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : File;

  return (
    <div
      onClick={onOpen}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
        {kind === "image" && asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{asset.filename}</p>
        <p className="text-xs text-muted-foreground">{Math.round(score * 100)}% match</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowInFolder();
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-xs font-bold text-primary clay-sm clay-press"
      >
        <FolderOpen className="h-4 w-4" strokeWidth={2.5} /> Show in folder
      </button>
    </div>
  );
}
