"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";

import { searchAssets, type Asset } from "@/lib/api";

const MIN_SIMILARITY = 0.55; // drop weak matches so search feels precise

export function SearchBar({
  assets,
  onResults,
}: {
  assets: Asset[];
  onResults: (results: Asset[] | null) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const byId = React.useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      onResults(null);
      return;
    }
    setLoading(true);
    try {
      const raw = await searchAssets(q);
      const matched = raw
        .filter((r) => r.similarity >= MIN_SIMILARITY)
        .map((r) => byId.get(r.id))
        .filter((a): a is Asset => Boolean(a));
      onResults(matched);
    } finally {
      setLoading(false);
    }
  }

  function onChange(value: string) {
    setQuery(value);
    if (value.trim() === "") onResults(null);
  }

  return (
    <form onSubmit={run} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your files by meaning… e.g. invoices from March"
        className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </form>
  );
}
