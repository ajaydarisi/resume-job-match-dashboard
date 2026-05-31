"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <Button type="button" onClick={refetchJobs} disabled={loading} variant="outline">
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Refetching" : "Refetch jobs"}
      </Button>
      {message ? <p className="max-w-xs text-right text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
