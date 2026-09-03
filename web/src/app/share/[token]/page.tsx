"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { getShare, type SharedAsset, type ShareResponse } from "@/lib/api";

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = React.useState<ShareResponse | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    getShare(params.token).then(setData).catch(() => setError(true));
  }, [params.token]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted-foreground">
        This share link is invalid or has expired.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted-foreground">Loading…</div>
    );
  }

  const assets: SharedAsset[] = data.type === "folder" ? data.assets : [data.asset];
  const title = data.type === "folder" ? data.folder.name : data.asset.filename;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm capitalize text-muted-foreground">Shared {data.type}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="overflow-hidden rounded-lg border border-border bg-card">
            {asset.mime_type?.startsWith("image/") && asset.url ? (
              // signed URL from a private bucket; plain img avoids next/image domain config
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.filename} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-muted px-3 text-center text-sm text-muted-foreground">
                {asset.filename}
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-medium">{asset.filename}</p>
              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Open
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
