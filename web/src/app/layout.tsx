import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SearchProvider } from "@/lib/search-context";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Asset Organizer",
    template: "%s · AI Asset Organizer",
  },
  description: "Upload files and let AI organize and semantically search them.",
  openGraph: {
    title: "AI Asset Organizer",
    description: "Upload files and let AI organize and semantically search them.",
    type: "website",
    siteName: "AI Asset Organizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Asset Organizer",
    description: "Upload files and let AI organize and semantically search them.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#23203a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="focus-ring sr-only rounded-xl bg-card px-4 py-2 font-bold focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <div aria-hidden className="app-backdrop pointer-events-none fixed inset-0 -z-10" />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SearchProvider>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Toaster />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
