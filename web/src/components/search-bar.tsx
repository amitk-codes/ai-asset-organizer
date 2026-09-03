"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";

import { searchAssets, type SearchResult } from "@/lib/api";
import { Card } from "@/components/ui/card";

export function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResults(await searchAssets(query));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={run} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by meaning… e.g. invoices from March"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </form>

      {results && (
        <Card className="divide-y divide-border">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No matches.</p>
          ) : (
            results.map((result) => (
              <div key={result.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="truncate">{result.filename}</span>
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                  {Math.round(result.similarity * 100)}% match
                </span>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
