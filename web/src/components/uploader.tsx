"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { uploadAsset } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED = ["image/", "application/pdf", "text/"];

type Status = "uploading" | "done" | "error" | "skipped";
type Item = { name: string; status: Status; reason?: string; progress?: number };

function accepted(file: File): boolean {
  return ACCEPTED.some((prefix) => file.type.startsWith(prefix));
}

export function Uploader({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    // validate up front so bad files don't sink the whole batch
    const initial: Item[] = files.map((file) => {
      if (!accepted(file)) return { name: file.name, status: "skipped", reason: "Unsupported type" };
      if (file.size > MAX_BYTES) return { name: file.name, status: "skipped", reason: "Over 25 MB" };
      return { name: file.name, status: "uploading", progress: 0 };
    });
    setItems(initial);
    setBusy(true);

    const patch = (i: number, next: Partial<Item>) =>
      setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...next } : it)));

    const uploads: Promise<Item>[] = files.map((file, i) => {
      if (initial[i].status === "skipped") return Promise.resolve(initial[i]);
      return uploadAsset(file, (pct) => patch(i, { progress: pct }))
        .then((): Item => {
          patch(i, { status: "done", progress: 100 });
          return { name: file.name, status: "done", progress: 100 };
        })
        .catch((): Item => {
          patch(i, { status: "error", reason: "Failed" });
          return { name: file.name, status: "error", reason: "Failed" };
        });
    });

    const settled = await Promise.all(uploads);
    setItems(settled);
    setBusy(false);

    const done = settled.filter((s) => s.status === "done").length;
    const failed = settled.filter((s) => s.status === "error").length;
    const skipped = settled.filter((s) => s.status === "skipped").length;

    if (done > 0) toast.success(`Uploaded ${done} file${done > 1 ? "s" : ""}`);
    if (failed > 0) toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
    if (skipped > 0) toast.warning(`${skipped} file${skipped > 1 ? "s" : ""} skipped`);
    if (done > 0) onUploaded();
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        className={cn(
          "focus-ring flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl bg-muted px-6 py-16 text-center transition-shadow clay-inset",
          dragging && "ring-2 ring-primary",
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" strokeWidth={2.5} />
          )}
        </span>
        <div>
          <p className="text-base font-extrabold">
            {busy ? "Uploading…" : "Drop files here or click to upload"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Images, PDFs and text documents · up to 25 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="rounded-xl bg-card px-3 py-2 clay-sm">
              <div className="flex items-center gap-2.5 text-sm">
                <StatusIcon status={item.status} />
                <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>
                {item.status === "uploading" ? (
                  <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                    {item.progress ?? 0}%
                  </span>
                ) : item.reason ? (
                  <span className="shrink-0 text-xs font-bold text-muted-foreground">
                    {item.reason}
                  </span>
                ) : null}
              </div>
              {item.status === "uploading" && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-150"
                    style={{ width: `${item.progress ?? 0}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "uploading") return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />;
  if (status === "done") return <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />;
  if (status === "error") return <AlertCircle className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2.5} />;
  return <X className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.5} />;
}
