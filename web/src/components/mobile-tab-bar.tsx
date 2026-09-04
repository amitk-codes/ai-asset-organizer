"use client";

import { LayoutGrid, Menu, Plus, Search, FolderClosed, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MobileTabBar({
  active,
  onFiles,
  onSearch,
  onUpload,
  onFolders,
  onMenu,
}: {
  active: "files" | "folders" | null;
  onFiles: () => void;
  onSearch: () => void;
  onUpload: () => void;
  onFolders: () => void;
  onMenu: () => void;
}) {
  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-lg md:hidden"
    >
      <div className="flex h-16 items-stretch justify-around px-1">
        <Tab icon={LayoutGrid} label="Files" active={active === "files"} onClick={onFiles} />
        <Tab icon={Search} label="Search" onClick={onSearch} />

        <button
          onClick={onUpload}
          aria-label="Upload"
          className="focus-ring -mt-5 flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/40"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Tab icon={FolderClosed} label="Folders" active={active === "folders"} onClick={onFolders} />
        <Tab icon={Menu} label="Menu" onClick={onMenu} />
      </div>
    </nav>
  );
}

function Tab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
      {label}
    </button>
  );
}
