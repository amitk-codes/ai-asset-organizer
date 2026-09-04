import Link from "next/link";
import { ArrowRight, ExternalLink, FolderTree, Search, Share2, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

const features = [
  { icon: Sparkles, title: "Understands your files", desc: "Images and PDFs are read, not just stored." },
  { icon: FolderTree, title: "AI-suggested folders", desc: "An agent proposes a structure — you approve." },
  { icon: Search, title: "Search by meaning", desc: "Find things in plain English, not by filename." },
  { icon: Share2, title: "Shareable", desc: "Share a folder or a file with a secure link." },
];

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6">
      <section className="flex flex-col items-center py-24 text-center">
        <span className="mb-7 inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-bold clay-sm">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} /> RAG + agentic AI
        </span>
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Upload your files.{" "}
          <span className="inline-block rounded-2xl bg-primary px-3 text-primary-foreground shadow-md shadow-violet-500/25">
            Let AI do the filing.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-lg text-muted-foreground">
          Assets are understood, grouped into folders you approve, and made searchable in plain English.
        </p>
        <div className="mt-9 flex gap-4">
          <Link href="/dashboard" className={buttonVariants()}>
            Get started <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <a
            href="https://github.com/amitk-codes/ai-asset-organizer"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            View source <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="clay-hover p-7">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
              <feature.icon className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <h3 className="text-base font-extrabold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
          </Card>
        ))}
      </section>
      </div>
      <SiteFooter />
    </>
  );
}
