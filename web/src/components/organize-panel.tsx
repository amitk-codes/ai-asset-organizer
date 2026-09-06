"use client";

import * as React from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { applyOrganization, suggestFolders, type Asset, type FolderPlan } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function OrganizePanel({ assets, onApplied }: { assets: Asset[]; onApplied: () => void }) {
  const [plan, setPlan] = React.useState<FolderPlan[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [applying, setApplying] = React.useState(false);

  const nameById = React.useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset.filename])),
    [assets],
  );
  const unorganizedCount = assets.filter((asset) => !asset.folder_id).length;

  async function suggest() {
    setLoading(true);
    try {
      setPlan(await suggestFolders());
    } catch {
      toast.error("Couldn't get suggestions.");
    } finally {
      setLoading(false);
    }
  }

  function renameFolder(index: number, name: string) {
    setPlan((prev) => prev?.map((folder, i) => (i === index ? { ...folder, name } : folder)) ?? prev);
  }

  function removeAsset(index: number, assetId: string) {
    setPlan(
      (prev) =>
        prev?.map((folder, i) =>
          i === index
            ? { ...folder, asset_ids: folder.asset_ids.filter((id) => id !== assetId) }
            : folder,
        ) ?? prev,
    );
  }

  async function apply() {
    if (!plan) return;
    setApplying(true);
    try {
      const applied = plan.filter((folder) => folder.asset_ids.length > 0);
      await applyOrganization(applied);
      toast.success(`Organized into ${applied.length} folder${applied.length > 1 ? "s" : ""}`);
      setPlan(null);
      onApplied();
    } catch {
      toast.error("Couldn't apply the organization.");
    } finally {
      setApplying(false);
    }
  }

  if (!plan) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 clay sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
            <Sparkles className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-extrabold">Organize your new files</p>
            <p className="text-sm text-muted-foreground">
              {unorganizedCount} file{unorganizedCount > 1 ? "s" : ""} ready — let AI sort them into folders.
            </p>
          </div>
        </div>
        <Button onClick={suggest} disabled={loading} className="w-full justify-center sm:w-auto">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          )}
          Organize with AI
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl bg-card p-6 clay">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Suggested folders</h2>
          <p className="text-sm text-muted-foreground">Review and edit, then apply.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={apply} disabled={applying}>
            {applying && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {plan.map((folder, index) => (
          <div key={index} className="rounded-2xl bg-muted p-4 clay-inset">
            <input
              value={folder.name}
              onChange={(e) => renameFolder(index, e.target.value)}
              aria-label="Folder name"
              className="focus-ring w-full rounded-lg bg-transparent px-1 text-[15px] font-extrabold outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {folder.asset_ids.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-card px-2.5 py-1 text-xs font-bold clay-sm"
                >
                  <span className="max-w-[130px] truncate">{nameById.get(id) ?? id}</span>
                  <button
                    onClick={() => removeAsset(index, id)}
                    aria-label={`Remove ${nameById.get(id) ?? "file"}`}
                    className="focus-ring rounded hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
