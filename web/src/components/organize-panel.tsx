"use client";

import * as React from "react";
import { Loader2, Sparkles, X } from "lucide-react";

import { applyOrganization, suggestFolders, type Asset, type FolderPlan } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      await applyOrganization(plan.filter((folder) => folder.asset_ids.length > 0));
      setPlan(null);
      onApplied();
    } finally {
      setApplying(false);
    }
  }

  if (!plan) {
    return (
      <Button onClick={suggest} disabled={loading || unorganizedCount === 0}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Organize with AI
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Suggested folders</h2>
          <p className="text-sm text-muted-foreground">Review and edit, then apply.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPlan(null)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={applying}>
            {applying && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {plan.map((folder, index) => (
          <Card key={index} className="p-4">
            <input
              value={folder.name}
              onChange={(e) => renameFolder(index, e.target.value)}
              className="w-full rounded-md bg-transparent text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {folder.asset_ids.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                >
                  <span className="max-w-[140px] truncate">{nameById.get(id) ?? id}</span>
                  <button onClick={() => removeAsset(index, id)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
