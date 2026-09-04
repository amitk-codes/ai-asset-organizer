"use client";

import * as React from "react";
import { File, FileText, FolderOpen, Image as ImageIcon, Loader2, Search } from "lucide-react";

import { searchAssets, type Asset } from "@/lib/api";
import { fileKind } from "@/lib/file-types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [activeIndex, setActiveIndex] = React.useState(0);
  const byId = React.useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);

  // ⌘K / Ctrl-K opens the spotlight from anywhere
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function reset() {
    setQuery("");
    setResults(null);
    setActiveIndex(0);
  }

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
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (!results || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      onOpenAsset(results[activeIndex].asset);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex w-full items-center gap-3 rounded-2xl bg-card px-5 py-3.5 text-left text-[15px] font-medium text-muted-foreground clay-inset"
      >
        <Search className="h-5 w-5 shrink-0" strokeWidth={2.5} />
        <span className="flex-1 truncate">Search your files by meaning…</span>
        <kbd className="hidden shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent
          variant="top"
          title="Search your files"
          overlayClassName="bg-black/50"
          className="max-w-2xl"
        >
          <div className="relative h-fit w-full">
            <form onSubmit={run} className="relative">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.5}
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) setResults(null);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search your files by meaning…"
                aria-label="Search your files by meaning"
                className="w-full rounded-3xl bg-card py-5 pl-14 pr-14 text-lg font-bold shadow-2xl outline-none placeholder:font-semibold placeholder:text-muted-foreground"
              />
              {loading && (
                <Loader2 className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </form>

            {loading && !results && (
              <div className="mt-3 space-y-2 overflow-hidden rounded-3xl bg-card p-3 shadow-2xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results && (
              <div className="mt-3 overflow-hidden rounded-3xl bg-card shadow-2xl">
                {results.length === 0 ? (
                  <p className="p-6 text-center text-sm font-semibold text-muted-foreground">
                    No strong matches. Try different words.
                  </p>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto p-2">
                    {results.map(({ asset, score }, i) => (
                      <Result
                        key={asset.id}
                        asset={asset}
                        score={score}
                        active={i === activeIndex}
                        onHover={() => setActiveIndex(i)}
                        onOpen={() => {
                          onOpenAsset(asset);
                          setOpen(false);
                        }}
                        onShowInFolder={() => {
                          onShowInFolder(asset);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Result({
  asset,
  score,
  active,
  onHover,
  onOpen,
  onShowInFolder,
}: {
  asset: Asset;
  score: number;
  active: boolean;
  onHover: () => void;
  onOpen: () => void;
  onShowInFolder: () => void;
}) {
  const kind = fileKind(asset.mime_type);
  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : File;

  return (
    <div
      onClick={onOpen}
      onMouseMove={onHover}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={-1}
      aria-label={`Open ${asset.filename}`}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors",
        active ? "bg-muted" : "hover:bg-muted",
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
        {kind === "image" && asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
        className="focus-ring flex shrink-0 items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-xs font-bold text-primary clay-sm clay-press"
      >
        <FolderOpen className="h-4 w-4" strokeWidth={2.5} /> Show in folder
      </button>
    </div>
  );
}
