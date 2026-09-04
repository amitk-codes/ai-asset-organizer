"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronUp, KeyRound, Link2, LogOut, RefreshCw, UserRound, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function AccountMenu({
  onManageShares,
  onCopyKey,
  onRotate,
  onSignOut,
}: {
  onManageShares: () => void;
  onCopyKey: () => void;
  onRotate: () => void;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="focus-ring flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground transition-shadow clay-sm clay-press hover:text-foreground data-[state=open]:text-foreground">
          <UserRound className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span className="flex-1 text-left">Account</span>
          <ChevronUp className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2.5} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={10}
          className="anim-center z-50 min-w-[13rem] rounded-2xl bg-card p-1.5 shadow-2xl clay"
        >
          <MenuItem icon={Link2} label="Shared links" onSelect={onManageShares} />
          <MenuItem icon={KeyRound} label="Copy key" onSelect={onCopyKey} />
          <MenuItem icon={RefreshCw} label="New key" onSelect={onRotate} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <MenuItem icon={LogOut} label="Sign out" onSelect={onSignOut} danger />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onSelect,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold outline-none transition-colors",
        danger
          ? "text-red-500 data-[highlighted]:bg-red-500/10"
          : "text-muted-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      {label}
    </DropdownMenu.Item>
  );
}
