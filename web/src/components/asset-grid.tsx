import { type Asset } from "@/lib/api";
import { AssetCard } from "@/components/asset-card";

export function AssetGrid({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No files here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
