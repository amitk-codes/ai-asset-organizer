"use client";

import * as React from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { login, setKey, signup } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-bold">Save your key</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is the only way back into your workspace. Store it somewhere safe.
          </p>
          <code className="mt-5 block break-all rounded-md bg-muted px-3 py-3 text-sm">
            {generated}
          </code>
          <div className="mt-4 flex gap-2">
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
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <h1 className="text-xl font-bold">Your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your key to sign in, or generate a new one.
        </p>

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="key_…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" className="w-full" disabled={busy || !keyInput.trim()}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGenerate} disabled={busy}>
          Generate a new key
        </Button>
      </div>
    </div>
  );
}
