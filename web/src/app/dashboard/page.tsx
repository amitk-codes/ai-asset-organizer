"use client";

import * as React from "react";

import { listAssets, listFolders, type Asset, type Folder } from "@/lib/api";
import { AppSidebar } from "@/components/app-sidebar";
import { AssetDetail } from "@/components/asset-detail";
import { AssetGrid } from "@/components/asset-grid";
import { EmptyState } from "@/components/empty-state";
import { GridToolbar, type SortKey, type TypeFilter } from "@/components/grid-toolbar";
import { OrganizePanel } from "@/components/organize-panel";
import { SearchBar } from "@/components/search-bar";
import { SkeletonGrid } from "@/components/skeleton-grid";
import { Uploader } from "@/components/uploader";

export default function DashboardPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<Asset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState<Asset[] | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");

  const refresh = React.useCallback(async () => {
    try {
      const [nextAssets, nextFolders] = await Promise.all([listAssets(), listFolders()]);
      setAssets(nextAssets);
      setFolders(nextFolders);
    } catch {
      // backend may not be running yet — fall through to the empty state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const visible = selected ? assets.filter((asset) => asset.folder_id === selected) : assets;
  const filtered = [...visible]
    .filter((asset) => {
      if (typeFilter === "image") return asset.mime_type?.startsWith("image/");
      if (typeFilter === "doc") return !asset.mime_type?.startsWith("image/");
      return true;
    })
    .sort((a, b) =>
      sort === "name"
        ? a.filename.localeCompare(b.filename)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const title = selected
    ? folders.find((folder) => folder.id === selected)?.name ?? "Folder"
    : "All files";

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar
        folders={folders}
        totalCount={assets.length}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {loading ? (
            <SkeletonGrid />
          ) : assets.length === 0 ? (
            <EmptyState onUploaded={refresh} />
          ) : (
            <>
              <SearchBar assets={assets} onResults={setSearch} />

              {search !== null ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Search results{" "}
                    <span className="font-normal text-muted-foreground">· {search.length}</span>
                  </h2>
                  {search.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                      No strong matches. Try different words.
                    </div>
                  ) : (
                    <AssetGrid assets={search} onOpen={setActive} />
                  )}
                </div>
              ) : (
                <>
                  <Uploader onUploaded={refresh} />
                  <OrganizePanel assets={assets} onApplied={refresh} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold">
                        {title}{" "}
                        <span className="font-normal text-muted-foreground">· {filtered.length}</span>
                      </h2>
                      <GridToolbar
                        type={typeFilter}
                        onType={setTypeFilter}
                        sort={sort}
                        onSort={setSort}
                      />
                    </div>
                    <AssetGrid assets={filtered} onOpen={setActive} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <AssetDetail
        asset={active}
        folders={folders}
        onClose={() => setActive(null)}
        onMoved={refresh}
      />
    </div>
  );
}
