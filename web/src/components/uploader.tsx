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
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card px-6 py-14 text-center transition-colors hover:border-primary/50",
        dragging && "border-primary bg-primary/5",
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
      </span>
      <div>
        <p className="font-medium">{busy ? "Uploading…" : "Drop files here or click to upload"}</p>
        <p className="text-sm text-muted-foreground">Images, PDFs and text documents</p>
      </div>
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
