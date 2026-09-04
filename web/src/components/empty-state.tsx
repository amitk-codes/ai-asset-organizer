import { FolderTree, Search, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

const steps = [
  { icon: Sparkles, title: "Upload anything", desc: "Images, PDFs and documents. AI reads each one." },
  { icon: FolderTree, title: "Let AI organize", desc: "It suggests folders — you approve." },
  { icon: Search, title: "Find by meaning", desc: "Search in plain English, not by filename." },
];

export function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="mx-auto max-w-3xl py-10 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight">Start by uploading your files</h2>
      <p className="mt-3 text-base text-muted-foreground">
        Three steps to an organized, searchable library.
      </p>

      <div className="my-10 grid gap-5 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl bg-card p-6 text-left clay">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/30">
              <step.icon className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <h3 className="text-base font-extrabold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>

      <Button onClick={onUpload}>
        <Upload className="h-5 w-5" strokeWidth={2.5} /> Upload files
      </Button>
    </div>
  );
}
