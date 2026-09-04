import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
        <Sparkles className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-base font-extrabold tracking-tight">
          <span className="text-primary">AI</span> Asset Organizer
        </span>
        <span className="block text-xs font-semibold text-muted-foreground">by Amit Kumar</span>
      </span>
    </span>
  );
}
