import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Database,
  Eye,
  FolderTree,
  Layers,
  Lock,
  Network,
  Search,
  Share2,
  Sparkles,
  Workflow,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

const techPills = [
  "RAG",
  "Agentic AI",
  "Gemini Vision",
  "Gemini Embeddings",
  "Groq",
  "pgvector · HNSW",
  "MCP Server",
  "FastAPI",
  "Next.js",
];

const features = [
  { icon: Sparkles, title: "Understands your files", desc: "Images and PDFs are read, not just stored." },
  { icon: FolderTree, title: "AI-suggested folders", desc: "An agent proposes a structure — you approve." },
  { icon: Search, title: "Search by meaning", desc: "Find things in plain English, not by filename." },
  { icon: Share2, title: "Shareable", desc: "Share a folder or a file with a secure, expiring link." },
];

const steps = [
  { n: "01", title: "Understand", desc: "Gemini captions every image and reads each PDF into rich, searchable text." },
  { n: "02", title: "Embed", desc: "That text becomes a 768-dim vector, stored in Postgres with pgvector." },
  { n: "03", title: "Organize", desc: "An LLM agent proposes subject-based folders — you review and confirm." },
  { n: "04", title: "Retrieve", desc: "Your query is embedded and matched by cosine similarity over an HNSW index." },
];

const underHood = [
  { icon: Eye, title: "Multimodal understanding", desc: "Vision captions for images, text extraction for PDFs — every asset becomes describable, searchable content." },
  { icon: Search, title: "Retrieval-Augmented (RAG)", desc: "Asymmetric query/document embeddings ranked by cosine distance over a pgvector HNSW index, inside the database." },
  { icon: Bot, title: "Agentic organizing", desc: "An LLM agent groups files by subject and returns structured JSON. Human-in-the-loop: the AI proposes, you decide." },
  { icon: Network, title: "MCP server", desc: "The same capabilities are exposed as Model Context Protocol tools — usable from Claude Desktop, not just the web app." },
  { icon: Database, title: "Vector + Storage", desc: "Supabase Postgres holds embeddings and metadata; a private bucket serves files via short-lived signed URLs." },
  { icon: Lock, title: "Private workspaces", desc: "A single workspace key — hashed, never stored in plaintext — scopes every file, folder and search to you." },
];

const stack = [
  { label: "Next.js + Tailwind", icon: Layers },
  { label: "FastAPI (Python)", icon: Workflow },
  { label: "Supabase · pgvector", icon: Database },
  { label: "Gemini + Groq", icon: Sparkles },
];

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6">
        {/* hero */}
        <section className="flex flex-col items-center py-20 text-center sm:py-24">
          <span className="mb-7 inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-bold clay-sm">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} /> RAG + agentic AI
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Upload your files.{" "}
            <span className="inline-block rounded-2xl bg-primary px-3 text-primary-foreground shadow-md shadow-violet-500/25">
              Let AI do the filing.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
            A full-stack AI librarian: it reads your images and documents, organizes them with an
            agent, and lets you search in plain English.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {techPills.map((p) => (
              <span
                key={p}
                className="rounded-xl bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground clay-sm"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className={buttonVariants()}>
              Get started <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </div>
        </section>

        {/* feature cards */}
        <section className="grid gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* how it works */}
        <section className="py-16 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From raw upload to semantic search — the pipeline.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl bg-card p-6 clay">
                <span className="text-2xl font-extrabold text-primary">{s.n}</span>
                <h3 className="mt-3 text-base font-extrabold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* under the hood */}
        <section className="pb-16 sm:pb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Under the hood</h2>
            <p className="mt-3 text-muted-foreground">
              The AI and infrastructure that make it work.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {underHood.map((item) => (
              <div key={item.title} className="rounded-3xl bg-card p-7 clay-hover">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <h3 className="text-base font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* tech stack strip */}
        <section className="pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center clay sm:p-10">
            <h2 className="text-xl font-extrabold sm:text-2xl">Built end-to-end</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {stack.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm font-bold clay-inset"
                >
                  <s.icon className="h-4 w-4 text-primary" strokeWidth={2.5} /> {s.label}
                </span>
              ))}
            </div>
            <Link href="/dashboard" className={buttonVariants()}>
              Try it now <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
