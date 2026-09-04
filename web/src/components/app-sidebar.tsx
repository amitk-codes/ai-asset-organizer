"use client";

import * as React from "react";
import {
  Files,
  Folder as FolderIcon,
  Inbox,
  KeyRound,
  Link2,
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
import { ShareButton } from "@/components/share-button";
import { SocialLinks } from "@/components/social-links";

export type SidebarSection = "upload" | "nav" | "folders" | "account" | "brand";
const ALL: SidebarSection[] = ["upload", "nav", "folders", "account", "brand"];

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
  onManageShares,
  onSignOut,
  className,
  sections = ALL,
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
  onManageShares: () => void;
  onSignOut: () => void;
  className?: string;
  sections?: SidebarSection[];
}) {
  const has = (s: SidebarSection) => sections.includes(s);

  return (
    <aside className={cn("h-full w-full shrink-0 flex-col p-5", className ?? "hidden md:flex md:w-72")}>
      {has("upload") && (
        <Button className="w-full" onClick={onUpload}>
          <Plus className="h-5 w-5" strokeWidth={2.5} /> Upload
        </Button>
      )}

      {has("nav") && (
        <div className={cn("space-y-1", has("upload") && "mt-6")}>
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
      )}

      {has("folders") && (
        <>
          {folders.length > 0 && (
            <p className="mb-2 mt-7 px-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Folders
            </p>
          )}
          <FolderScroll>
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                active={selected === folder.id}
                onClick={() => onSelect(folder.id)}
                onDelete={() => onDeleteFolder(folder.id)}
              />
            ))}
          </FolderScroll>
        </>
      )}

      {has("account") && (
        <div
          className={cn("space-y-1.5", has("folders") ? "mt-3 border-t border-border pt-4" : "")}
        >
          <FooterItem icon={Link2} label="Shared links" onClick={onManageShares} />
          <FooterItem icon={KeyRound} label="Copy key" onClick={onCopyKey} />
          <FooterItem icon={RefreshCw} label="New key" onClick={onRotate} />
          <FooterItem icon={LogOut} label="Sign out" onClick={onSignOut} />
        </div>
      )}

      {has("brand") && (
        <div className="mt-auto border-t border-border pt-4">
          <p className="text-sm font-extrabold tracking-tight">
            <span className="text-primary">AI</span> Asset Organizer
          </p>
          <p className="text-xs font-semibold text-muted-foreground">by Amit Kumar</p>
          <div className="mt-3">
            <SocialLinks />
          </div>
        </div>
      )}
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
        "focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-bold transition-shadow",
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
      <button
        onClick={onClick}
        className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
      >
        <FolderIcon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
        <span className="flex-1 truncate">{folder.name}</span>
      </button>
      {/* actions: always shown on touch, hover-revealed on desktop */}
      <span
        onClick={(e) => e.stopPropagation()}
        className="inline-flex shrink-0 md:hidden md:group-hover:inline-flex"
      >
        <ShareButton targetType="folder" targetId={folder.id} />
      </span>
      <button
        onClick={onDelete}
        aria-label="Delete folder"
        className="focus-ring inline-flex shrink-0 rounded-lg text-muted-foreground hover:text-red-500 md:hidden md:group-hover:inline-flex"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <span className="hidden shrink-0 text-xs text-muted-foreground md:inline md:group-hover:hidden">
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
      className="focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      {label}
    </button>
  );
}

/** Scrollable folder list with edge fades + a thin scrollbar, so it's obvious
    the region scrolls (and where it ends) even when the sidebar is short. */
function FolderScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const edges = useEdgeFade(scrollRef, innerRef);

  return (
    <div className="relative min-h-12 flex-1">
      <div ref={scrollRef} className="scrollbar-thin h-full overflow-y-auto pr-1">
        <div ref={innerRef} className="space-y-2">
          {children}
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent transition-opacity",
          edges.top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent transition-opacity",
          edges.bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

function useEdgeFade(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  innerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [edges, setEdges] = React.useState({ top: false, bottom: false });

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // fires on scroll (event) and on size change (ResizeObserver, async) —
    // never a synchronous setState in the effect body
    const update = () =>
      setEdges({
        top: el.scrollTop > 4,
        bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4,
      });
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRef, innerRef]);

  return edges;
}
