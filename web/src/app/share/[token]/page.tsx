"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { getShare, type SharedAsset, type ShareResponse } from "@/lib/api";

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = React.useState<ShareResponse | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    getShare(params.token)
      .then(setData)
      .catch(() => setError(true));
  }, [params.token]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center font-semibold text-muted-foreground">
        This share link is invalid or has expired.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center font-semibold text-muted-foreground">
        Loading…
      </div>
    );
  }

  const assets: SharedAsset[] = data.type === "folder" ? data.assets : [data.asset];
  const title = data.type === "folder" ? data.folder.name : data.asset.filename;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1.5 text-sm font-semibold capitalize text-muted-foreground">
        Shared {data.type}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-3xl bg-card p-3.5 clay">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted clay-inset">
              {asset.mime_type?.startsWith("image/") && asset.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-sm font-semibold text-muted-foreground">
                  {asset.filename}
                </div>
              )}
            </div>
            <div className="px-1.5 pb-1 pt-3.5">
              <p className="truncate text-[15px] font-extrabold">{asset.filename}</p>
              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:underline"
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
