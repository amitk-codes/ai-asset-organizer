"use client";

import * as React from "react";
import { Copy, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { listShares, revokeShare, type Asset, type Folder, type ShareRecord } from "@/lib/api";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

export function ShareManager({
  open,
  onClose,
  assets,
  folders,
}: {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  folders: Folder[];
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        title="Shared links"
        description="Copy or revoke links you've created."
        className="max-w-lg rounded-3xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Shared links</h3>
          <DialogClose
            aria-label="Close"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </DialogClose>
        </div>
        {/* mounts fresh each time the dialog opens, so it fetches on open */}
        <ShareList assets={assets} folders={folders} />
      </DialogContent>
    </Dialog>
  );
}

function ShareList({ assets, folders }: { assets: Asset[]; folders: Folder[] }) {
  const [shares, setShares] = React.useState<ShareRecord[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    listShares()
      .then((s) => !cancelled && setShares(s))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  function label(share: ShareRecord): string {
    if (share.target_type === "folder") {
      return folders.find((f) => f.id === share.target_id)?.name ?? "Folder";
    }
    return assets.find((a) => a.id === share.target_id)?.filename ?? "File";
  }

  async function revoke(id: string) {
    try {
      await revokeShare(id);
      setShares((prev) => prev?.filter((s) => s.id !== id) ?? prev);
      toast.success("Share revoked");
    } catch {
      toast.error("Couldn't revoke the share.");
    }
  }

  function copy(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/share/${id}`);
    toast.success("Link copied");
  }

  if (error) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-muted-foreground">
        Couldn&apos;t load your shares.
      </p>
    );
  }
  if (!shares) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (shares.length === 0) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-muted-foreground">
        You haven&apos;t shared anything yet.
      </p>
    );
  }

  return (
    <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
      {shares.map((share) => (
        <li key={share.id} className="flex items-center gap-3 rounded-2xl bg-muted p-3 clay-inset">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{label(share)}</p>
            <p className="text-xs text-muted-foreground">
              {share.target_type} · {expiryLabel(share)}
            </p>
          </div>
          <button
            onClick={() => copy(share.id)}
            aria-label="Copy link"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground clay-sm clay-press hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => revoke(share.id)}
            aria-label="Revoke link"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-card text-red-500 clay-sm clay-press"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function expiryLabel(share: ShareRecord): string {
  if (share.revoked) return "revoked";
  if (!share.expires_at) return "never expires";
  const when = new Date(share.expires_at);
  if (when.getTime() < Date.now()) return "expired";
  return `expires ${when.toLocaleDateString()}`;
}
