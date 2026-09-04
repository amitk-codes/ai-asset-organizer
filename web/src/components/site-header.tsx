import Link from "next/link";

import { HeaderSearch } from "@/components/header-search";
import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-lg">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex flex-1 justify-center">
          <HeaderSearch />
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden sm:flex">
            <SocialLinks />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
