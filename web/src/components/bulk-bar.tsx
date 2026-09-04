"use client";

import { Trash2, X } from "lucide-react";

import { type Folder } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function BulkBar({
  count,
  folders,
  onMove,
  onDelete,
  onClear,
}: {
  count: number;
  folders: Folder[];
  onMove: (folderId: string | null) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="bottom-above-tabbar fixed inset-x-0 z-40 flex justify-center px-4 md:bottom-6">
      <div className="fade-in flex flex-wrap items-center gap-3 rounded-3xl bg-card px-4 py-3 shadow-2xl clay">
        <span className="text-sm font-extrabold">
          {count} selected
        </span>
        <select
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return;
            onMove(v === "__none__" ? null : v);
            e.target.value = "";
          }}
          aria-label="Move selected to folder"
          className="focus-ring rounded-xl bg-muted px-3 py-2 text-sm font-bold outline-none clay-inset"
        >
          <option value="" disabled>
            Move to…
          </option>
          <option value="__none__">Unorganized</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" strokeWidth={2.5} /> Delete
        </Button>
        <button
          onClick={onClear}
          aria-label="Clear selection"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
