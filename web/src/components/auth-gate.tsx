"use client";

import * as React from "react";
import { Bot, Copy, Eye, Loader2, Lock, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { login, setKey, signup } from "@/lib/api";
import { Button } from "@/components/ui/button";

const highlights = [
  { icon: Eye, title: "It reads your files", desc: "Vision for images, text extraction for PDFs." },
  { icon: Bot, title: "An agent organizes", desc: "AI proposes subject folders — you approve." },
  { icon: Search, title: "Search by meaning", desc: "RAG over pgvector, in plain English." },
  { icon: Lock, title: "Private by key", desc: "One workspace key, hashed and never stored raw." },
];

const pills = ["RAG", "Agentic AI", "Gemini", "Groq", "pgvector", "MCP"];

export function AuthGate({ onAuthed }: { onAuthed: () => void }) {
  const [keyInput, setKeyInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [generated, setGenerated] = React.useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    setBusy(true);
    try {
      if (await login(key)) {
        setKey(key);
        onAuthed();
      } else {
        toast.error("That key doesn't exist.");
      }
    } catch {
      toast.error("Couldn't sign in. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate() {
    setBusy(true);
    try {
      const newKey = await signup();
      setKey(newKey);
      setGenerated(newKey);
    } catch {
      toast.error("Couldn't create a workspace.");
    } finally {
      setBusy(false);
    }
  }

  if (generated) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-md flex-col justify-center px-6">
        <div className="rounded-3xl bg-card p-8 text-center clay">
          <h1 className="text-2xl font-extrabold">Save your key</h1>
          <p className="mt-2.5 text-sm text-muted-foreground">
            This is the only way back into your workspace. Store it somewhere safe.
          </p>
          <code className="mt-6 block break-all rounded-2xl bg-muted px-4 py-4 text-sm font-bold clay-inset">
            {generated}
          </code>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(generated);
                toast.success("Key copied");
              }}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button className="flex-1" onClick={onAuthed}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-5xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
      {/* pitch panel — desktop only */}
      <div className="hidden lg:block">
        <span className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-bold clay-sm">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} /> RAG + agentic AI
        </span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          Your <span className="text-primary">AI-organized</span> workspace
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Upload anything. It gets understood, grouped into folders you approve, and made searchable
          in plain English.
        </p>
        <ul className="mt-8 space-y-4">
          {highlights.map((h) => (
            <li key={h.title} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
                <h.icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[15px] font-extrabold">{h.title}</p>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2">
          {pills.map((p) => (
            <span key={p} className="rounded-lg bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground clay-sm">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* sign-in card */}
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <div className="rounded-3xl bg-card p-8 clay">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
            <Sparkles className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="text-2xl font-extrabold">Your workspace</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your key to sign in, or generate a new one.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3.5">
            <input
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="key_…"
              aria-label="Workspace key"
              className="focus-ring w-full rounded-2xl bg-muted px-4 py-3 text-[15px] font-semibold outline-none clay-inset placeholder:font-medium placeholder:text-muted-foreground"
            />
            <Button type="submit" className="w-full" disabled={busy || !keyInput.trim()}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-bold text-muted-foreground">
            <span className="h-0.5 flex-1 rounded bg-border" /> OR{" "}
            <span className="h-0.5 flex-1 rounded bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGenerate} disabled={busy}>
            Generate a new key
          </Button>
        </div>
      </div>
    </div>
  );
}
