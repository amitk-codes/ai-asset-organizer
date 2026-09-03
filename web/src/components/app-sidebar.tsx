"use client";

import { Files, Folder as FolderIcon, type LucideIcon } from "lucide-react";

import { type Folder } from "@/lib/api";
import { cn } from "@/lib/utils";

export function AppSidebar({
  folders,
  totalCount,
  selected,
  onSelect,
}: {
  folders: Folder[];
  totalCount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border p-3 md:block">
      <NavItem
        icon={Files}
        label="All files"
        count={totalCount}
        active={selected === null}
        onClick={() => onSelect(null)}
      />

      {folders.length > 0 && (
        <p className="mt-6 mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Folders
        </p>
      )}
      <div className="space-y-0.5">
        {folders.map((folder) => (
          <NavItem
            key={folder.id}
            icon={FolderIcon}
            label={folder.name}
            count={folder.count}
            active={selected === folder.id}
            onClick={() => onSelect(folder.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
