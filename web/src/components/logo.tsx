import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
        <Sparkles className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="block leading-tight">
        <span className="block text-sm font-extrabold tracking-tight sm:text-base">
          <span className="text-primary">AI</span> Asset Organizer
        </span>
      </span>
    </span>
  );
}
