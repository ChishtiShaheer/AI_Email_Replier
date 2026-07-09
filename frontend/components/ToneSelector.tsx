"use client";

import type { Tone } from "@/lib/api";

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "concise", label: "Concise" },
];

export default function ToneSelector({
  value,
  onChange,
}: {
  value: Tone;
  onChange: (tone: Tone) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Reply tone">
      {TONES.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide transition-colors ${
              active
                ? "border-accent bg-accent text-paper"
                : "border-ink/15 bg-transparent text-ink/70 hover:border-accent/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}