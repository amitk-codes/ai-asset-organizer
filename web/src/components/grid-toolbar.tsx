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
    <div className="flex items-center gap-2.5">
      <div className="flex rounded-2xl bg-card p-1.5 clay-inset">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => onType(t.key)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-[13px] font-bold transition-shadow",
              type === t.key
                ? "bg-primary text-primary-foreground clay-sm"
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
        className="rounded-2xl bg-card px-3 py-2.5 text-[13px] font-bold outline-none clay-inset"
      >
        <option value="newest">Newest</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
