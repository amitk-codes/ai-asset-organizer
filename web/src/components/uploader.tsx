"use client";

import * as React from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { uploadAsset } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Uploader({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadAsset(file)));
      toast.success(`Uploaded ${uploaded.length} file${uploaded.length > 1 ? "s" : ""}`);
      onUploaded();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
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
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl bg-muted px-6 py-16 text-center transition-shadow clay-inset",
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
        <p className="mt-1 text-sm text-muted-foreground">Images, PDFs and text documents</p>
      </div>
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
