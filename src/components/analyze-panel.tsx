"use client";

import { useState } from "react";
import { FileUp, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { preferredCityOptions } from "@/lib/cities";
import type { AnalysisResponse } from "@/lib/types";

type AnalyzeResult = AnalysisResponse & { error?: string };

async function readAnalyzeResponse(response: Response): Promise<AnalyzeResult> {
  if (response.headers.get("content-type")?.includes("application/json")) {
    return (await response.json()) as AnalyzeResult;
  }

  const detail = await response.text();
  return {
    error: response.status === 504 ? "Analysis timed out. Please try again." : detail || "Analysis failed.",
  } as AnalyzeResult;
}

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

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const json = await readAnalyzeResponse(response);

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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>
          Upload your resume, add your contact details, choose preferred cities, and analyze with Ollama Cloud.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Name</Label>
            <Input
              id="candidate-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-mobile">Mobile number</Label>
            <Input
              id="candidate-mobile"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              placeholder="+91..."
            />
          </div>
        </div>
        <Label
          htmlFor="resume-upload"
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center transition-colors hover:bg-muted/50"
        >
          <FileUp className="h-6 w-6 text-primary" />
          <span className="mt-2 text-sm font-medium">
            {resumeFile ? resumeFile.name : "Upload resume"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">PDF, TXT, or Markdown</span>
          <Input
            id="resume-upload"
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            className="sr-only"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          />
        </Label>
        <div className="space-y-2">
          <Label>Preferred cities</Label>
          <div className="flex flex-wrap gap-2">
            {preferredCityOptions.map((city) => {
              const selected = preferredCities.includes(city);
              return (
                <Button
                  key={city}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  onClick={() => toggleCity(city)}
                >
                  {city}
                </Button>
              );
            })}
          </div>
        </div>
        <Button type="button" onClick={runAnalysis} disabled={loading} className="w-full sm:w-auto">
          <Play className="h-4 w-4" />
          {loading ? "Analyzing with Ollama" : "Analyze"}
        </Button>
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
