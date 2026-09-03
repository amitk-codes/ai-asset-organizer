"use client";

import * as React from "react";

import { listAssets, type Asset } from "@/lib/api";
import { AssetGrid } from "@/components/asset-grid";
import { OrganizePanel } from "@/components/organize-panel";
import { SearchBar } from "@/components/search-bar";
import { Uploader } from "@/components/uploader";

export default function DashboardPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);

  const refresh = React.useCallback(async () => {
    try {
      setAssets(await listAssets());
    } catch {
      // backend may not be running yet — show the empty state
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Your assets</h1>
      <p className="mt-1 text-muted-foreground">Upload files and let AI organize them.</p>

      <div className="mt-8 space-y-8">
        <SearchBar />
        <Uploader onUploaded={refresh} />
        <OrganizePanel assets={assets} onApplied={refresh} />
        <AssetGrid assets={assets} />
      </div>
    </div>
  );
}
