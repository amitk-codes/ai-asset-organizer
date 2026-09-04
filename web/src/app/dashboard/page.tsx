"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { toast } from "sonner";

import {
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { GridToolbar, type SortKey, type TypeFilter } from "@/components/grid-toolbar";
import { KeyModal } from "@/components/key-modal";
import { SkeletonGrid } from "@/components/skeleton-grid";
import { UploadModal } from "@/components/upload-modal";

export default function DashboardPage() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<Asset | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [loading, setLoading] = React.useState(true);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [folderToDelete, setFolderToDelete] = React.useState<string | null>(null);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);

  const { setConfig } = useSearch();

  const load = React.useCallback(async () => {
    const [nextAssets, nextFolders] = await Promise.all([listAssets(), listFolders()]);
    setAssets(nextAssets);
    setFolders(nextFolders);
  }, []);

  const reload = React.useCallback(() => {
    load().catch(() => {});
  }, [load]);

  React.useEffect(() => {
    if (!getKey()) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    // optimistic: assume the key is valid so the skeleton shows while loading
    setAuthed(true);
    load()
      .catch(() => {
        clearKey();
        setAuthed(false);
      })
      .finally(() => setLoading(false));
  }, [load]);

  const showInFolder = React.useCallback((asset: Asset) => {
    setSelected(asset.folder_id ?? UNORGANIZED);
    setHighlightId(asset.id);
    window.setTimeout(() => setHighlightId(null), 2000);
  }, []);

  // publish search to the navbar while there are files to search
  React.useEffect(() => {
    setConfig(
      authed && assets.length > 0
        ? { assets, onOpenAsset: setActive, onShowInFolder: showInFolder }
        : null,
    );
    return () => setConfig(null);
  }, [assets, authed, setConfig, showInFolder]);

  function handleAuthed() {
    setAuthed(true);
    setLoading(true);
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleSignOut() {
    clearKey();
    setAuthed(false);
    setAssets([]);
    setFolders([]);
    setSelected(null);
  }

  function handleCopyKey() {
    const key = getKey();
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success("Key copied");
    }
  }

  async function handleRotate() {
    try {
      const key = await rotateKey();
      setKey(key);
      setNewKey(key);
    } catch {
      toast.error("Couldn't generate a new key.");
    }
  }

  function handleDeleteFolder(id: string) {
    setFolderToDelete(id);
  }

  async function confirmDeleteFolder() {
    const id = folderToDelete;
    setFolderToDelete(null);
    if (!id) return;
    try {
      await deleteFolder(id);
      if (selected === id) setSelected(null);
      toast.success("Folder deleted");
      reload();
    } catch {
      toast.error("Couldn't delete the folder.");
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
    onDeleteFolder: handleDeleteFolder,
    onCopyKey: handleCopyKey,
    onRotate: handleRotate,
    onSignOut: handleSignOut,
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <AppSidebar {...sidebarProps} onSelect={setSelected} />

      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fade-in absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} />
          <div className="slide-in-left relative h-full w-72 bg-background">
            <AppSidebar
              {...sidebarProps}
              className="flex"
              onSelect={(id) => {
                setSelected(id);
                setMobileNav(false);
              }}
              onUpload={() => {
                setMobileNav(false);
                setUploadOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <div className="h-full min-w-0 flex-1 overflow-y-auto px-5 py-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <button
            onClick={() => setMobileNav(true)}
            className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 text-sm font-bold clay-sm clay-press md:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={2.5} /> Folders
          </button>

          {loading ? (
            <SkeletonGrid />
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
              <AssetGrid assets={filtered} onOpen={setActive} highlightId={highlightId} />
            </div>
          )}
        </div>
      </div>

      <AssetDetail
        asset={active}
        folders={folders}
        onClose={() => setActive(null)}
        onMoved={reload}
        onDeleted={() => {
          setActive(null);
          reload();
        }}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onReload={reload}
        assets={assets}
      />

      <KeyModal keyValue={newKey} onClose={() => setNewKey(null)} />

      <ConfirmDialog
        open={folderToDelete !== null}
        title="Delete folder?"
        description="The files inside are kept and moved out of the folder."
        confirmLabel="Delete"
        onConfirm={confirmDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />
    </div>
  );
}
