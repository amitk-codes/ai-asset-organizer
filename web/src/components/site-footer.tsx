import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="px-6 py-8 text-center text-sm font-semibold text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by Amit Kumar
      </span>
    </footer>
  );
}
