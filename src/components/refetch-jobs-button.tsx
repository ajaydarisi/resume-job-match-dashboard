"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { AnalysisResponse } from "@/lib/types";

export function RefetchJobsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function refetchJobs() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/jobs/refetch", { method: "POST" });
    const json = (await response.json()) as AnalysisResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(json.error ?? "Could not refetch jobs.");
      return;
    }

    setMessage(
      `Added ${json.inserted_jobs ?? 0} new jobs. Skipped ${json.skipped_duplicates ?? 0} duplicates.`,
    );
    setTimeout(() => location.reload(), 700);
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={refetchJobs}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Refetching" : "Refetch jobs"}
      </button>
      {message ? <p className="max-w-xs text-right text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}
