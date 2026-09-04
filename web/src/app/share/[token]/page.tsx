import type { Metadata } from "next";
import { ExternalLink, File, FileText, Image as ImageIcon, Sparkles } from "lucide-react";

import { getShare, type SharedAsset, type ShareResponse } from "@/lib/api";
import { fileKind, typeMeta } from "@/lib/file-types";
import { stripMarkdown } from "@/lib/utils";

async function loadShare(token: string): Promise<ShareResponse | null> {
  try {
    return await getShare(token);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/share/[token]">): Promise<Metadata> {
  const { token } = await params;
  const data = await loadShare(token);
  if (!data) {
    return { title: "Shared link", description: "This share link is invalid or has expired." };
  }

  const isFolder = data.type === "folder";
  const title = isFolder ? data.folder.name : data.asset.filename;
  const count = isFolder ? data.assets.length : 1;
  const description = isFolder
    ? `A shared folder with ${count} file${count !== 1 ? "s" : ""} on AI Asset Organizer.`
    : "A file shared via AI Asset Organizer.";

  const firstImage = (isFolder ? data.assets : [data.asset]).find(
    (a) => a.mime_type?.startsWith("image/") && a.url,
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: firstImage?.url ? [firstImage.url] : undefined,
    },
    twitter: {
      card: firstImage?.url ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: PageProps<"/share/[token]">) {
  const { token } = await params;
  const data = await loadShare(token);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center font-semibold text-muted-foreground">
        This share link is invalid or has expired.
      </div>
    );
  }

  const isFolder = data.type === "folder";
  const assets: SharedAsset[] = isFolder ? data.assets : [data.asset];
  const title = isFolder ? data.folder.name : data.asset.filename;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} /> Shared via AI Asset Organizer
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        {isFolder ? `Folder · ${assets.length} file${assets.length !== 1 ? "s" : ""}` : "Shared file"}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <ShareCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}

function ShareCard({ asset }: { asset: SharedAsset }) {
  const kind = fileKind(asset.mime_type);
  const meta = typeMeta[kind];
  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : File;
  const ext = asset.filename.includes(".")
    ? asset.filename.split(".").pop()!.toUpperCase()
    : "FILE";

  return (
    <div className="rounded-3xl bg-card p-3.5 clay">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted clay-inset">
        {kind === "image" && asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.filename}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : asset.content_text ? (
          <div className="h-full w-full overflow-hidden bg-paper p-4 text-left">
            <p className="line-clamp-6 text-[10px] leading-relaxed text-paper-foreground">
              {stripMarkdown(asset.content_text)}
            </p>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icon className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-xs font-extrabold uppercase">{ext}</span>
          </div>
        )}
      </div>
      <div className="px-1.5 pb-1 pt-3.5">
        <span
          className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold ${meta.tint}`}
        >
          {meta.label}
        </span>
        <p className="mt-2 truncate text-[15px] font-extrabold">{asset.filename}</p>
        {asset.content_text && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {stripMarkdown(asset.content_text)}
          </p>
        )}
        {asset.url && (
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-2 inline-flex items-center gap-1 rounded-md text-xs font-bold text-primary hover:underline"
          >
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
