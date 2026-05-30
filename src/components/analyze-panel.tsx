"use client";

import { useState } from "react";
import { FileUp, Play } from "lucide-react";
import { preferredCityOptions } from "@/lib/cities";
import type { AnalysisResponse } from "@/lib/types";

export function AnalyzePanel() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [preferredCities, setPreferredCities] = useState<string[]>(["Bengaluru"]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function toggleCity(city: string) {
    setPreferredCities((current) =>
      current.includes(city) ? current.filter((item) => item !== city) : [...current, city],
    );
  }

  async function runAnalysis() {
    if (!resumeFile) {
      setMessage("Upload your resume before analyzing.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("name", name);
    formData.append("mobile", mobile);
    preferredCities.forEach((city) => formData.append("preferredCities", city));

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });
    const json = (await response.json()) as AnalysisResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(json.error ?? "Analysis failed.");
      return;
    }

    setMessage(
      `Saved ${json.inserted_jobs ?? json.jobs.length} new jobs. Skipped ${
        json.skipped_duplicates ?? 0
      } duplicates. Refreshing dashboard...`,
    );
    setTimeout(() => location.reload(), 600);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Complete your profile</h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload your resume, add your contact details, choose preferred cities, and analyze with Ollama Cloud.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-200">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
            placeholder="Your full name"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-200">Mobile number</span>
          <input
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
            placeholder="+91..."
          />
        </label>
      </div>
      <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/20 p-4 text-center hover:bg-white/[0.04]">
        <FileUp className="h-6 w-6 text-cyan-200" />
        <span className="mt-2 text-sm font-medium text-white">
          {resumeFile ? resumeFile.name : "Upload resume"}
        </span>
        <span className="mt-1 text-xs text-slate-400">PDF, TXT, or Markdown</span>
        <input
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="sr-only"
          onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className="mt-4">
        <p className="text-sm text-slate-200">Preferred cities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {preferredCityOptions.map((city) => {
            const selected = preferredCities.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={`min-h-9 rounded-md border px-3 text-sm transition ${
                  selected
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-black/20 text-slate-100 hover:bg-white/10"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={runAnalysis}
        disabled={loading}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Play className="h-4 w-4" />
        {loading ? "Analyzing with Ollama" : "Analyze"}
      </button>
      {message ? <p className="mt-3 rounded-md bg-white/10 p-3 text-sm text-slate-100">{message}</p> : null}
    </section>
  );
}
