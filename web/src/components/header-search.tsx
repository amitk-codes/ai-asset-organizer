"use client";

import { useSearch } from "@/lib/search-context";
import { SpotlightSearch } from "@/components/spotlight-search";

export function HeaderSearch() {
  const { config } = useSearch();
  if (!config) return null;

  return (
    // trigger hidden on mobile (search lives in the bottom tab bar); the
    // overlay is portaled to body, so it still opens via the tab / ⌘K
    <div className="mx-2 hidden max-w-md flex-1 md:block">
      <SpotlightSearch
        assets={config.assets}
        onOpenAsset={config.onOpenAsset}
        onShowInFolder={config.onShowInFolder}
      />
    </div>
  );
}
