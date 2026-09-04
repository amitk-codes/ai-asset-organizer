import { type Asset } from "@/lib/api";
import { AssetCard } from "@/components/asset-card";

export function AssetGrid({
  assets,
  onOpen,
  highlightId,
}: {
  assets: Asset[];
  onOpen: (asset: Asset) => void;
  highlightId?: string | null;
}) {
  if (assets.length === 0) {
    return (
      <div className="rounded-3xl bg-card py-20 text-center text-sm font-semibold text-muted-foreground clay-inset">
        No files here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onOpen={() => onOpen(asset)}
          highlighted={asset.id === highlightId}
        />
      ))}
    </div>
  );
}
