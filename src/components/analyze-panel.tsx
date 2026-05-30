"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { sampleResume } from "@/lib/sample-resume";
import type { AnalysisResponse } from "@/lib/types";

export function AnalyzePanel() {
  const [resumeText, setResumeText] = useState(sampleResume);
  const [resumeName, setResumeName] = useState("Ajay-Darisi-Resume.pdf");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, resumeName }),
    });
    const json = (await response.json()) as AnalysisResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(json.error ?? "Analysis failed.");
      return;
    }

    setMessage(`Saved ${json.jobs.length} scored jobs. Refreshing dashboard...`);
    setTimeout(() => location.reload(), 600);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Run analysis</h2>
          <p className="mt-1 text-sm text-slate-300">
            Paste resume text, score Bengaluru jobs, and save the JSON to Supabase.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResumeText(sampleResume)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-slate-100 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Sample
          </button>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {loading ? "Analyzing" : "Analyze"}
          </button>
        </div>
      </div>
      <input
        value={resumeName}
        onChange={(event) => setResumeName(event.target.value)}
        className="mt-4 min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
        placeholder="Resume name"
      />
      <textarea
        value={resumeText}
        onChange={(event) => setResumeText(event.target.value)}
        className="mt-3 min-h-56 w-full resize-y rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-100 outline-none"
        placeholder="Paste resume text here"
      />
      {message ? <p className="mt-3 rounded-md bg-white/10 p-3 text-sm text-slate-100">{message}</p> : null}
    </section>
  );
}
