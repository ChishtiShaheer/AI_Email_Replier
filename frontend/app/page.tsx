"use client";

import { useState } from "react";
import ToneSelector from "@/components/ToneSelector";
import ReplyCard from "@/components/ReplyCard";
import { generateReply, type Tone, type GenerateReplyResponse } from "@/lib/api";

type InputMode = "paste" | "upload";

export default function Home() {
  const [mode, setMode] = useState<InputMode>("paste");
  const [emailText, setEmailText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateReplyResponse | null>(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (mode === "paste" && !emailText.trim()) {
      setError("Paste an email first.");
      return;
    }
    if (mode === "upload" && !file) {
      setError("Choose a file to upload.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateReply({
        tone,
        emailText: mode === "paste" ? emailText : undefined,
        file: mode === "upload" ? file ?? undefined : undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Correspondence, handled</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">AI Email Reply Assistant</h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Paste an email or upload one, pick a tone, and get a polished reply ready to send — with
          sentiment, a subject line, and final edits still in your hands.
        </p>
      </header>

      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm">
        <div className="mb-4 flex gap-2 font-mono text-xs uppercase tracking-wide">
          <button
            onClick={() => setMode("paste")}
            className={`rounded-full px-3 py-1 transition-colors ${
              mode === "paste" ? "bg-ink text-paper" : "bg-ink/5 text-ink/60"
            }`}
          >
            Paste text
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`rounded-full px-3 py-1 transition-colors ${
              mode === "upload" ? "bg-ink text-paper" : "bg-ink/5 text-ink/60"
            }`}
          >
            Upload file
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the email you received here…"
            rows={8}
            className="w-full resize-y rounded-xl border border-ink/15 bg-paper p-4 text-sm leading-relaxed text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        ) : (
          <input
            type="file"
            accept=".txt,.eml"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-dashed border-ink/25 bg-paper p-6 text-sm text-ink/60 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-paper"
          />
        )}

        <div className="mt-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/45">Reply tone</p>
          <ToneSelector value={tone} onChange={setTone} />
        </div>

        {error && <p className="mt-4 text-sm text-accent">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Drafting…" : "Generate reply"}
          </button>
        </div>
      </section>

      {result && (
        <section className="mt-8">
          <ReplyCard result={result} />
        </section>
      )}
    </main>
  );
}