"use client";

import { cn } from "@/lib/utils";

export type TypeFilter = "all" | "image" | "doc";
export type SortKey = "newest" | "name";

const TYPES: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "doc", label: "Docs" },
];

export function GridToolbar({
  type,
  onType,
  sort,
  onSort,
}: {
  type: TypeFilter;
  onType: (type: TypeFilter) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md border border-border p-0.5">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => onType(t.key)}
            className={cn(
              "rounded px-2.5 py-1 text-xs transition-colors",
              type === t.key
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as SortKey)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="newest">Newest</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
