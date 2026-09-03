import { FolderTree, Search, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

const steps = [
  { icon: Sparkles, title: "Upload anything", desc: "Images, PDFs and documents. AI reads each one." },
  { icon: FolderTree, title: "Let AI organize", desc: "It suggests folders — you approve." },
  { icon: Search, title: "Find by meaning", desc: "Search in plain English, not by filename." },
];

export function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Start by uploading your files</h2>
      <p className="mt-2 text-muted-foreground">
        Three steps to an organized, searchable library.
      </p>

      <div className="my-8 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-lg border border-border bg-card p-4 text-left">
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>

      <Button onClick={onUpload}>
        <Upload className="h-4 w-4" /> Upload files
      </Button>
    </div>
  );
}
