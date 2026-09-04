import * as React from "react";

import { cn } from "@/lib/utils";

// A tiny renderer for the small markdown subset our AI captions use (bold, bullet
// lists, paragraphs). It emits React elements only — never raw HTML — so it is
// XSS-safe by construction, and avoids pulling in a full markdown dependency.

function inline(text: string, keyBase: string): React.ReactNode[] {
  // split on **bold** — odd segments sit between a pair of markers
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyBase}-${i}`}>{part}</strong>
    ) : (
      <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>
    ),
  );
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flush = () => {
    if (!bullets.length) return;
    const items = bullets;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc space-y-1 pl-5">
        {items.map((it, i) => (
          <li key={i}>{inline(it, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
    key += 1;
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flush();
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const content = heading ? heading[1] : line;
    blocks.push(
      <p key={`p-${key}`} className={heading ? "font-bold" : undefined}>
        {inline(content, `p-${key}`)}
      </p>,
    );
    key += 1;
  }
  flush();

  return <div className={cn("space-y-2", className)}>{blocks}</div>;
}
