"use client";

import { useSearch } from "@/lib/search-context";
import { SpotlightSearch } from "@/components/spotlight-search";

export function HeaderSearch() {
  const { config } = useSearch();
  if (!config) return null;

  return (
    <div className="mx-2 max-w-md flex-1">
      <SpotlightSearch
        assets={config.assets}
        onOpenAsset={config.onOpenAsset}
        onShowInFolder={config.onShowInFolder}
      />
    </div>
  );
}
