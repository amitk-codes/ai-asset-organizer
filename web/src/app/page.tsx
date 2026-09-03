import { ArrowRight, FolderTree, Search, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Sparkles, title: "Understands your files", desc: "Images and PDFs are read, not just stored." },
  { icon: FolderTree, title: "AI-suggested folders", desc: "An agent proposes a structure — you approve." },
  { icon: Search, title: "Search by meaning", desc: "Find things in plain English, not by filename." },
  { icon: Share2, title: "Shareable", desc: "Share a folder or a file with a secure link." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="flex flex-col items-center py-24 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          RAG + agentic AI
        </span>
        <h1 className="max-w-2xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Upload your files. Let AI do the filing.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Assets are understood, grouped into folders you approve, and made searchable in plain English.
        </p>
        <div className="mt-8 flex gap-3">
          <Button>
            Get started <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">View demo</Button>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="p-6">
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{feature.desc}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
