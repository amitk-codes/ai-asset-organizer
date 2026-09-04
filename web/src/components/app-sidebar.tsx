"use client";

import {
  Files,
  Folder as FolderIcon,
  Inbox,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { type Folder } from "@/lib/api";
import { UNORGANIZED } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar({
  folders,
  totalCount,
  unorganizedCount,
  selected,
  onSelect,
  onUpload,
  onDeleteFolder,
  onCopyKey,
  onRotate,
  onSignOut,
  className,
}: {
  folders: Folder[];
  totalCount: number;
  unorganizedCount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onUpload: () => void;
  onDeleteFolder: (id: string) => void;
  onCopyKey: () => void;
  onRotate: () => void;
  onSignOut: () => void;
  className?: string;
}) {
  return (
    <aside className={cn("h-full w-72 shrink-0 flex-col p-5", className ?? "hidden md:flex")}>
      <Button className="w-full" onClick={onUpload}>
        <Plus className="h-5 w-5" strokeWidth={2.5} /> Upload
      </Button>

      <div className="mt-6 space-y-1">
        <NavItem
          icon={Files}
          label="All files"
          count={totalCount}
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        <NavItem
          icon={Inbox}
          label="Unorganized"
          count={unorganizedCount}
          active={selected === UNORGANIZED}
          onClick={() => onSelect(UNORGANIZED)}
        />
      </div>

      {folders.length > 0 && (
        <p className="mb-2 mt-7 px-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Folders
        </p>
      )}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            active={selected === folder.id}
            onClick={() => onSelect(folder.id)}
            onDelete={() => onDeleteFolder(folder.id)}
          />
        ))}
      </div>

      <div className="space-y-1.5 pt-4">
        <FooterItem icon={KeyRound} label="Copy key" onClick={onCopyKey} />
        <FooterItem icon={RefreshCw} label="New key" onClick={onRotate} />
        <FooterItem icon={LogOut} label="Sign out" onClick={onSignOut} />
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
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-bold transition-shadow",
        active ? "clay-inset text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
      <span className="flex-1 truncate text-left">{label}</span>
      <span className={cn("text-xs", active ? "text-primary" : "text-muted-foreground")}>
        {count}
      </span>
    </button>
  );
}

function FolderItem({
  folder,
  active,
  onClick,
  onDelete,
}: {
  folder: Folder;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-bold transition-shadow",
        active ? "clay-inset text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <FolderIcon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
        <span className="flex-1 truncate">{folder.name}</span>
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete folder"
        className="hidden shrink-0 text-muted-foreground hover:text-red-500 group-hover:block"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <span className="shrink-0 text-xs text-muted-foreground group-hover:hidden">
        {folder.count}
      </span>
    </div>
  );
}

function FooterItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      {label}
    </button>
  );
}
