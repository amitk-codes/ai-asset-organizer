import { type Asset } from "@/lib/api";
import { AssetCard } from "@/components/asset-card";

export function AssetGrid({
  assets,
  onOpen,
  highlightId,
  selectedIds,
  onToggleSelect,
}: {
  assets: Asset[];
  onOpen: (asset: Asset) => void;
  highlightId?: string | null;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}) {
  if (assets.length === 0) {
    return (
      <div className="rounded-3xl bg-card py-20 text-center text-sm font-semibold text-muted-foreground clay-inset">
        No files here yet.
      </div>
    );
  }

  const selectionActive = (selectedIds?.size ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          index={index}
          onOpen={() => onOpen(asset)}
          highlighted={asset.id === highlightId}
          selected={selectedIds?.has(asset.id) ?? false}
          selectionActive={selectionActive}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(asset.id) : undefined}
        />
      ))}
    </div>
  );
}
