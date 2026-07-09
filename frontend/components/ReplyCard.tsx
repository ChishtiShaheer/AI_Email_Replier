"use client";

import { useState } from "react";
import type { GenerateReplyResponse } from "@/lib/api";

export default function ReplyCard({ result }: { result: GenerateReplyResponse }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const [draft, setDraft] = useState(result.replies[0] ?? "");
  const [copied, setCopied] = useState(false);

  function selectVariant(i: number) {
    setActiveVariant(i);
    setDraft(result.replies[i]);
    setCopied(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="postmark" aria-hidden="true">
          <span className="postmark-label">sent</span>
          <span className="postmark-sentiment">{result.sentiment}</span>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/45">Suggested subject</p>
          <p className="font-serif text-lg text-ink">{result.subject_suggestion}</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-ink/60">{result.summary}</p>

      {result.replies.length > 1 && (
        <div className="mb-3 flex gap-2">
          {result.replies.map((_, i) => (
            <button
              key={i}
              onClick={() => selectVariant(i)}
              className={`rounded-md px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors ${
                i === activeVariant ? "bg-ink text-paper" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              Variant {i + 1}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="w-full resize-y rounded-xl border border-ink/15 bg-paper p-4 text-sm leading-relaxed text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleCopy}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {copied ? "Copied ✓" : "Copy reply"}
        </button>
      </div>
    </div>
  );
}