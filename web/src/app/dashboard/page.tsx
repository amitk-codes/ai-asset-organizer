"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  ApiError,
  batchDeleteAssets,
  batchMoveAssets,
  clearKey,
  deleteFolder,
  getKey,
  listAssets,
  listFolders,
  rotateKey,
  setKey,
  type Asset,
  type Folder,
} from "@/lib/api";
import { UNORGANIZED } from "@/lib/constants";
import { useSearch } from "@/lib/search-context";
import { AppSidebar } from "@/components/app-sidebar";
import { AssetDetail } from "@/components/asset-detail";
import { AssetGrid } from "@/components/asset-grid";
import { AuthGate } from "@/components/auth-gate";
import { BulkBar } from "@/components/bulk-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { GridToolbar, type SortKey, type TypeFilter } from "@/components/grid-toolbar";
import { KeyModal } from "@/components/key-modal";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ShareManager } from "@/components/share-manager";
import { SkeletonGrid } from "@/components/skeleton-grid";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UploadModal } from "@/components/upload-modal";

const PAGE_SIZE = 60;

function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function DashboardPage() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(() => readStored("dash_selected"));
  const [active, setActive] = React.useState<Asset | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>(
    () => (readStored("dash_type") as TypeFilter) ?? "all",
  );
  const [sort, setSort] = React.useState<SortKey>(
    () => (readStored("dash_sort") as SortKey) ?? "newest",
  );
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [sharesOpen, setSharesOpen] = React.useState(false);
  const [folderToDelete, setFolderToDelete] = React.useState<string | null>(null);
  const [rotateConfirm, setRotateConfirm] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const [foldersSheet, setFoldersSheet] = React.useState(false);
  const [menuSheet, setMenuSheet] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);

  const { setConfig, openSearch } = useSearch();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // ---- persistence ----
  React.useEffect(() => writeStored("dash_selected", selected), [selected]);
  React.useEffect(() => writeStored("dash_type", typeFilter), [typeFilter]);
  React.useEffect(() => writeStored("dash_sort", sort), [sort]);

  // ---- data loading ----
  const fetchFirst = React.useCallback(async () => {
    const [page, nextFolders] = await Promise.all([
      listAssets({ limit: PAGE_SIZE }),
      listFolders(),
    ]);
    setAssets(page.items);
    setCursor(page.next_cursor);
    setFolders(nextFolders);
  }, []);

  const onLoadError = React.useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      clearKey();
      setAuthed(false);
    } else {
      setLoadError(true);
    }
  }, []);

  const refresh = React.useCallback(() => {
    fetchFirst().catch(() => {});
  }, [fetchFirst]);

  const loadMore = React.useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await listAssets({ limit: PAGE_SIZE, cursor });
      setAssets((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...page.items.filter((a) => !seen.has(a.id))];
      });
      setCursor(page.next_cursor);
    } catch {
      toast.error("Couldn't load more files.");
      setCursor(null); // stop trying
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getKey()) {
        if (!cancelled) {
          setAuthed(false);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setAuthed(true);
      try {
        await fetchFirst();
      } catch (e) {
        if (!cancelled) onLoadError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchFirst, onLoadError]);

  // infinite scroll: observe a sentinel at the bottom of the scroll area
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  const showInFolder = React.useCallback((asset: Asset) => {
    setSelected(asset.folder_id ?? UNORGANIZED);
    setHighlightId(asset.id);
    window.setTimeout(() => setHighlightId(null), 2000);
  }, []);

  // publish search to the navbar whenever signed in (search stays available even
  // with zero files — it just returns no matches)
  React.useEffect(() => {
    setConfig(
      authed ? { assets, onOpenAsset: setActive, onShowInFolder: showInFolder } : null,
    );
    return () => setConfig(null);
  }, [assets, authed, setConfig, showInFolder]);

  function handleAuthed() {
    setAuthed(true);
    setLoading(true);
    setLoadError(false);
    fetchFirst()
      .catch(onLoadError)
      .finally(() => setLoading(false));
  }

  function handleSignOut() {
    clearKey();
    setAuthed(false);
    setAssets([]);
    setFolders([]);
    setSelected(null);
    setSelectedIds(new Set());
  }

  function handleCopyKey() {
    const key = getKey();
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success("Key copied");
    }
  }

  async function handleRotate() {
    setRotateConfirm(false);
    try {
      const key = await rotateKey();
      setKey(key);
      setNewKey(key);
    } catch {
      toast.error("Couldn't generate a new key.");
    }
  }

  async function confirmDeleteFolder() {
    const id = folderToDelete;
    setFolderToDelete(null);
    if (!id) return;
    try {
      await deleteFolder(id);
      if (selected === id) setSelected(null);
      toast.success("Folder deleted");
      refresh();
    } catch {
      toast.error("Couldn't delete the folder.");
    }
  }

  // ---- bulk selection ----
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkMove(folderId: string | null) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      await batchMoveAssets(ids, folderId);
      toast.success(`Moved ${ids.length} file${ids.length > 1 ? "s" : ""}`);
      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error("Couldn't move the selected files.");
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleteOpen(false);
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      await batchDeleteAssets(ids);
      toast.success(`Deleted ${ids.length} file${ids.length > 1 ? "s" : ""}`);
      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error("Couldn't delete the selected files.");
    }
  }

  if (authed === null) return null;
  if (!authed) return <AuthGate onAuthed={handleAuthed} />;

  const visible =
    selected === null
      ? assets
      : selected === UNORGANIZED
        ? assets.filter((a) => !a.folder_id)
        : assets.filter((a) => a.folder_id === selected);

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

  const title =
    selected === null
      ? "All files"
      : selected === UNORGANIZED
        ? "Unorganized"
        : folders.find((folder) => folder.id === selected)?.name ?? "Folder";

  const unorganizedCount = assets.filter((asset) => !asset.folder_id).length;

  const sidebarProps = {
    folders,
    totalCount: assets.length,
    unorganizedCount,
    selected,
    onUpload: () => setUploadOpen(true),
    onDeleteFolder: (id: string) => setFolderToDelete(id),
    onCopyKey: handleCopyKey,
    onRotate: () => setRotateConfirm(true),
    onManageShares: () => setSharesOpen(true),
    onSignOut: handleSignOut,
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)]">
      <AppSidebar {...sidebarProps} onSelect={setSelected} />

      <div
        ref={scrollRef}
        className="h-full min-w-0 flex-1 overflow-y-auto px-5 py-8 lg:px-12 lg:py-10"
      >
        <div className="mx-auto max-w-7xl space-y-8">
          {loading ? (
            <SkeletonGrid />
          ) : loadError ? (
            <ErrorState
              onRetry={() => {
                setLoadError(false);
                setLoading(true);
                fetchFirst()
                  .catch(onLoadError)
                  .finally(() => setLoading(false));
              }}
            />
          ) : assets.length === 0 ? (
            <EmptyState onUpload={() => setUploadOpen(true)} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">
                  {title}{" "}
                  <span className="font-normal text-muted-foreground">· {filtered.length}</span>
                </h2>
                <GridToolbar type={typeFilter} onType={setTypeFilter} sort={sort} onSort={setSort} />
              </div>
              <AssetGrid
                assets={filtered}
                onOpen={setActive}
                highlightId={highlightId}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
              <div ref={sentinelRef} className="h-1" />
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
          {/* clears the fixed mobile tab bar */}
          <div className="pb-tabbar md:hidden" aria-hidden />
        </div>
      </div>

      <AssetDetail
        asset={active}
        folders={folders}
        onClose={() => setActive(null)}
        onMoved={refresh}
        onDeleted={() => {
          setActive(null);
          refresh();
        }}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onReload={refresh}
        assets={assets}
      />

      <ShareManager
        open={sharesOpen}
        onClose={() => setSharesOpen(false)}
        assets={assets}
        folders={folders}
      />

      <KeyModal keyValue={newKey} onClose={() => setNewKey(null)} />

      <BulkBar
        count={selectedIds.size}
        folders={folders}
        onMove={bulkMove}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

      <ConfirmDialog
        open={folderToDelete !== null}
        title="Delete folder?"
        description="The files inside are kept and moved out of the folder."
        confirmLabel="Delete"
        onConfirm={confirmDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />

      <ConfirmDialog
        open={rotateConfirm}
        title="Generate a new key?"
        description="Your current key stops working immediately. Your files stay, but anyone using the old key loses access."
        confirmLabel="Generate"
        onConfirm={handleRotate}
        onCancel={() => setRotateConfirm(false)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.size} file${selectedIds.size > 1 ? "s" : ""}?`}
        description="This permanently removes the selected files."
        confirmLabel="Delete"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      {/* mobile bottom navigation */}
      <MobileTabBar
        active={selected === null ? "files" : "folders"}
        onFiles={() => {
          setSelected(null);
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSearch={openSearch}
        onUpload={() => setUploadOpen(true)}
        onFolders={() => setFoldersSheet(true)}
        onMenu={() => setMenuSheet(true)}
      />

      <Dialog open={foldersSheet} onOpenChange={(next) => !next && setFoldersSheet(false)}>
        <DialogContent variant="drawer-left" title="Folders" className="max-w-[20rem] bg-background">
          <AppSidebar
            {...sidebarProps}
            sections={["nav", "folders"]}
            className="flex w-full"
            onSelect={(id) => {
              setSelected(id);
              setFoldersSheet(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={menuSheet} onOpenChange={(next) => !next && setMenuSheet(false)}>
        <DialogContent variant="drawer-left" title="Menu" className="max-w-[20rem] bg-background">
          <AppSidebar
            {...sidebarProps}
            sections={["account", "brand"]}
            className="flex w-full"
            onSelect={setSelected}
            onManageShares={() => {
              setMenuSheet(false);
              setSharesOpen(true);
            }}
            onRotate={() => {
              setMenuSheet(false);
              setRotateConfirm(true);
            }}
            onSignOut={() => {
              setMenuSheet(false);
              handleSignOut();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
