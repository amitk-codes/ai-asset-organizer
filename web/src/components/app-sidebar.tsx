"use client";

import {
  Files,
  Folder as FolderIcon,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { type Folder } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar({
  folders,
  totalCount,
  selected,
  onSelect,
  onUpload,
  onDeleteFolder,
  onCopyKey,
  onRotate,
  onSignOut,
}: {
  folders: Folder[];
  totalCount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onUpload: () => void;
  onDeleteFolder: (id: string) => void;
  onCopyKey: () => void;
  onRotate: () => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-3 md:flex">
      <Button className="w-full" onClick={onUpload}>
        <Plus className="h-4 w-4" /> Upload
      </Button>

      <div className="mt-4">
        <NavItem
          icon={Files}
          label="All files"
          count={totalCount}
          active={selected === null}
          onClick={() => onSelect(null)}
        />
      </div>

      {folders.length > 0 && (
        <p className="mt-6 mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Folders
        </p>
      )}
      <div className="space-y-0.5">
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

      <div className="mt-auto space-y-0.5 border-t border-border pt-3">
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
        "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        <FolderIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{folder.name}</span>
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete folder"
        className="hidden shrink-0 text-muted-foreground hover:text-red-500 group-hover:block"
      >
        <Trash2 className="h-3.5 w-3.5" />
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
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
