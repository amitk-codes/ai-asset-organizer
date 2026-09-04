"use client";

import * as React from "react";
import { AlertCircle, Ban, Check, Clock, Loader2, RotateCcw, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { AbortError, uploadAsset, type UploadStage } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED = ["image/", "application/pdf", "text/"];
const CONCURRENCY = 3;

const STAGE_LABEL: Record<string, string> = {
  stored: "Uploaded",
  extracting: "Reading & describing…",
  embedding: "Indexing…",
};

type Status = "queued" | "uploading" | "processing" | "done" | "error" | "canceled" | "skipped";
type Item = {
  id: string;
  file: File;
  name: string;
  status: Status;
  reason?: string;
  progress: number;
  stage?: UploadStage;
};

export type UploaderHandle = { cancelAll: () => void };

function validate(file: File): { ok: true } | { ok: false; reason: string } {
  if (!ACCEPTED.some((p) => file.type.startsWith(p))) return { ok: false, reason: "Unsupported type" };
  if (file.size > MAX_BYTES) return { ok: false, reason: "Over 25 MB" };
  return { ok: true };
}

export const Uploader = React.forwardRef<
  UploaderHandle,
  { onUploaded: () => void; onBusyChange?: (busy: boolean) => void }
>(function Uploader({ onUploaded, onBusyChange }, ref) {
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const itemsRef = React.useRef<Item[]>([]);
  const controllers = React.useRef<Map<string, AbortController>>(new Map());
  const canceled = React.useRef<Set<string>>(new Set());

  function changeBusy(next: boolean) {
    setBusy(next);
    onBusyChange?.(next);
  }
  function commit(next: Item[]) {
    itemsRef.current = next;
    setItems(next);
  }
  const patch = React.useCallback((id: string, next: Partial<Item>) => {
    commit(itemsRef.current.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const uploadOne = React.useCallback(
    async (id: string, file: File): Promise<Status> => {
      const controller = new AbortController();
      controllers.current.set(id, controller);
      patch(id, { status: "uploading", progress: 0, stage: undefined });
      try {
        await uploadAsset(file, {
          onProgress: (pct) => patch(id, { progress: pct }),
          onStage: (stage) => patch(id, { status: "processing", stage }),
          signal: controller.signal,
        });
        patch(id, { status: "done", progress: 100 });
        return "done";
      } catch (e) {
        if (e instanceof AbortError || controller.signal.aborted) {
          patch(id, { status: "canceled" });
          return "canceled";
        }
        patch(id, { status: "error", reason: "Failed" });
        return "error";
      } finally {
        controllers.current.delete(id);
      }
    },
    [patch],
  );

  async function runPool(entries: { id: string; file: File }[]): Promise<Status[]> {
    const results: Status[] = [];
    let i = 0;
    const worker = async () => {
      while (i < entries.length) {
        const { id, file } = entries[i++];
        if (canceled.current.has(id)) {
          results.push("canceled");
          continue;
        }
        results.push(await uploadOne(id, file));
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, () => worker()));
    return results;
  }

  async function addFiles(fileList: FileList | null) {
    if (busy || !fileList || fileList.length === 0) return;
    canceled.current = new Set();
    const files = Array.from(fileList);
    const next: Item[] = files.map((file) => {
      const id = crypto.randomUUID();
      const v = validate(file);
      return v.ok
        ? { id, file, name: file.name, status: "queued" as Status, progress: 0 }
        : { id, file, name: file.name, status: "skipped" as Status, reason: v.reason, progress: 0 };
    });
    commit(next);
    changeBusy(true);

    const entries = next.filter((it) => it.status === "queued").map((it) => ({ id: it.id, file: it.file }));
    const results = await runPool(entries);
    changeBusy(false);

    const done = results.filter((r) => r === "done").length;
    const failed = results.filter((r) => r === "error").length;
    const skipped = next.filter((it) => it.status === "skipped").length;
    if (done > 0) toast.success(`Uploaded ${done} file${done > 1 ? "s" : ""}`);
    if (failed > 0) toast.error(`${failed} file${failed > 1 ? "s" : ""} failed`);
    if (skipped > 0) toast.warning(`${skipped} file${skipped > 1 ? "s" : ""} skipped`);
    if (done > 0) onUploaded();
  }

  const cancelOne = React.useCallback(
    (id: string) => {
      canceled.current.add(id);
      controllers.current.get(id)?.abort();
      patch(id, { status: "canceled" });
    },
    [patch],
  );

  const cancelAll = React.useCallback(() => {
    itemsRef.current.forEach((it) => {
      if (it.status === "queued" || it.status === "uploading" || it.status === "processing") {
        cancelOne(it.id);
      }
    });
  }, [cancelOne]);

  React.useImperativeHandle(ref, () => ({ cancelAll }), [cancelAll]);

  async function retryOne(id: string) {
    const it = itemsRef.current.find((x) => x.id === id);
    if (!it) return;
    canceled.current.delete(id);
    changeBusy(true);
    const res = await uploadOne(id, it.file);
    changeBusy(false);
    if (res === "done") onUploaded();
  }

  const activeCount = items.filter(
    (it) => it.status === "uploading" || it.status === "processing" || it.status === "queued",
  ).length;

  return (
    <div className="space-y-3">
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!busy && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (busy) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        aria-disabled={busy}
        className={cn(
          "focus-ring flex flex-col items-center justify-center gap-4 rounded-3xl bg-muted px-6 py-16 text-center transition-shadow clay-inset",
          busy ? "cursor-default opacity-70" : "cursor-pointer",
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
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <>
          {busy && activeCount > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground">{activeCount} in progress</span>
              <button
                onClick={cancelAll}
                className="focus-ring rounded-lg text-xs font-bold text-red-500 hover:underline"
              >
                Cancel all
              </button>
            </div>
          )}
          <ul className="space-y-1.5">
            {items.map((item) => (
              <Row key={item.id} item={item} onCancel={() => cancelOne(item.id)} onRetry={() => retryOne(item.id)} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
});

function Row({ item, onCancel, onRetry }: { item: Item; onCancel: () => void; onRetry: () => void }) {
  const cancelable = item.status === "queued" || item.status === "uploading" || item.status === "processing";
  const retryable = item.status === "error" || item.status === "canceled";

  return (
    <li className="rounded-xl bg-card px-3 py-2 clay-sm">
      <div className="flex items-center gap-2.5 text-sm">
        <StatusIcon status={item.status} />
        <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>

        {item.status === "uploading" && (
          <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
            {item.progress}%
          </span>
        )}
        {item.status === "processing" && (
          <span className="shrink-0 text-xs font-bold text-muted-foreground">
            {STAGE_LABEL[item.stage ?? "extracting"] ?? "Processing…"}
          </span>
        )}
        {item.status === "queued" && (
          <span className="shrink-0 text-xs font-bold text-muted-foreground">Queued</span>
        )}
        {item.reason && (
          <span className="shrink-0 text-xs font-bold text-muted-foreground">{item.reason}</span>
        )}
        {item.status === "canceled" && !item.reason && (
          <span className="shrink-0 text-xs font-bold text-muted-foreground">Canceled</span>
        )}

        {cancelable && (
          <button
            onClick={onCancel}
            aria-label="Cancel upload"
            className="focus-ring shrink-0 rounded-lg text-muted-foreground hover:text-red-500"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
        {retryable && (
          <button
            onClick={onRetry}
            aria-label="Retry upload"
            className="focus-ring flex shrink-0 items-center gap-1 rounded-lg text-xs font-bold text-primary hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} /> Retry
          </button>
        )}
      </div>

      {item.status === "uploading" && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
      {item.status === "processing" && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="bar-indeterminate h-full w-1/3 rounded-full bg-primary" />
        </div>
      )}
    </li>
  );
}

function StatusIcon({ status }: { status: Status }) {
  const cls = "h-4 w-4 shrink-0";
  if (status === "queued") return <Clock className={cn(cls, "text-muted-foreground")} strokeWidth={2.25} />;
  if (status === "uploading" || status === "processing")
    return <Loader2 className={cn(cls, "animate-spin text-muted-foreground")} />;
  if (status === "done") return <Check className={cn(cls, "text-primary")} strokeWidth={2.5} />;
  if (status === "error") return <AlertCircle className={cn(cls, "text-red-500")} strokeWidth={2.5} />;
  if (status === "canceled") return <Ban className={cn(cls, "text-muted-foreground")} strokeWidth={2.5} />;
  return <X className={cn(cls, "text-muted-foreground")} strokeWidth={2.5} />; // skipped
}
