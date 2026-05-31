import { analyzeResume, fetchLiveJobs, scoreJobs } from "@/lib/analyzer";
import type { JobMatch, ResumeAnalysis } from "@/lib/types";

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

type CandidateContext = {
  name: string;
  mobile: string;
  preferredCities: string[];
  resumeText: string;
};

const RESUME_PROMPT_LIMIT = 12_000;
const OLLAMA_ANALYSIS_TIMEOUT_MS = 25_000;
const OLLAMA_RERANK_TIMEOUT_MS = 12_000;

function getOllamaConfig() {
  const apiKey = process.env.OLLAMA_API_KEY;
  const model = process.env.OLLAMA_MODEL || "kimi-k2.5:cloud";

  if (!apiKey) {
    throw new Error("OLLAMA_API_KEY is not configured.");
  }

  return { apiKey, model };
}

function extractJsonObject(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Ollama response did not include a JSON object.");
  }

  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

async function ollamaJson(prompt: string, timeoutMs: number) {
  const { apiKey, model } = getOllamaConfig();
  let response: Response;

  try {
    response = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are a precise recruiting analyst. Return only valid JSON. Do not include markdown, comments, or prose outside JSON.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new Error(`Ollama Cloud request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }

    throw error;
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama Cloud request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const json = (await response.json()) as OllamaChatResponse;
  const content = json.message?.content;

  if (!content) {
    throw new Error("Ollama Cloud returned an empty response.");
  }

  return extractJsonObject(content);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normaliseAnalysis(value: unknown): ResumeAnalysis {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    skills: stringArray(record.skills),
    years_of_experience:
      typeof record.years_of_experience === "string" ? record.years_of_experience : "Not specified",
    seniority_level: typeof record.seniority_level === "string" ? record.seniority_level : "Not specified",
    technologies: stringArray(record.technologies),
    leadership_experience: stringArray(record.leadership_experience),
    summary: typeof record.summary === "string" ? record.summary : undefined,
  };
}

function normaliseJobs(value: unknown): JobMatch[] {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const jobs = Array.isArray(record.jobs) ? record.jobs : [];

  return jobs
    .map((job) => {
      const row = job && typeof job === "object" ? (job as Record<string, unknown>) : {};
      const applyUrl = typeof row.apply_url === "string" ? row.apply_url : "";
      const company = typeof row.company === "string" ? row.company : "Unknown";
      const title = typeof row.title === "string" ? row.title : "Software Engineer";
      const location = typeof row.location === "string" ? row.location : "Not specified";
      const score = typeof row.match_score === "number" ? row.match_score : Number(row.match_score);

      return {
        company,
        title,
        location,
        salary: typeof row.salary === "string" ? row.salary : "Not disclosed",
        match_score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 70,
        reason: typeof row.reason === "string" ? row.reason : "Relevant to the analyzed resume.",
        missing_skills: stringArray(row.missing_skills),
        apply_url: applyUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${title} ${company}`)}`,
        contact_email: typeof row.contact_email === "string" ? row.contact_email : null,
        contact_linkedin:
          typeof row.contact_linkedin === "string"
            ? row.contact_linkedin
            : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} recruiter ${location}`)}`,
        contact_reason:
          typeof row.contact_reason === "string"
            ? row.contact_reason
            : "Look for recruiters or engineering managers hiring for this role.",
      };
    })
    .filter((job) => job.company && job.title && job.apply_url)
    .slice(0, 20)
    .sort((a, b) => b.match_score - a.match_score);
}

export async function analyzeResumeWithOllama(context: CandidateContext) {
  try {
    const result = await ollamaJson(
      `Analyze this resume for software engineering jobs.

Candidate:
- Name: ${context.name}
- Mobile: ${context.mobile}
- Preferred cities: ${context.preferredCities.join(", ")}

Return JSON with this exact shape:
{
  "skills": [],
  "years_of_experience": "",
  "seniority_level": "",
  "technologies": [],
  "leadership_experience": [],
  "summary": ""
}

Resume:
${context.resumeText.slice(0, RESUME_PROMPT_LIMIT)}`,
      OLLAMA_ANALYSIS_TIMEOUT_MS,
    );

    return normaliseAnalysis(result);
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Ollama resume analysis failed.");
    return analyzeResume(context.resumeText);
  }
}

export async function findJobsWithOllama(resumeAnalysis: ResumeAnalysis, preferredCities: string[]) {
  const liveJobs = await fetchLiveJobs(preferredCities);
  const fallbackJobs = scoreJobs(liveJobs, resumeAnalysis);
  const context = fallbackJobs
    .map(
      (job, index) => `${index + 1}. ${job.title} at ${job.company}
Location: ${job.location}
Apply: ${job.apply_url}
Salary: ${job.salary}
Context: ${job.reason}
Missing skills from first pass: ${job.missing_skills.join(", ") || "none"}`,
    )
    .join("\n\n");

  try {
    const result = await ollamaJson(
      `Rank and improve these job matches for the candidate.

Resume analysis JSON:
${JSON.stringify(resumeAnalysis)}

Preferred cities: ${preferredCities.join(", ")}

Candidate jobs to rank:
${context}

Return JSON with this exact shape:
{
  "jobs": [
    {
      "company": "",
      "title": "",
      "location": "",
      "salary": "",
      "match_score": 0,
      "reason": "",
      "missing_skills": [],
      "apply_url": "",
      "contact_email": null,
      "contact_linkedin": "",
      "contact_reason": ""
    }
  ]
}

Rules:
- Return the strongest 10 to 15 jobs.
- Prefer the user's preferred cities.
- Preserve real apply URLs from the candidate jobs when available.
- Do not invent impossible salaries; use "Not disclosed" when unknown.
- Give recruiter/contact suggestions via email or LinkedIn search URL.`,
      OLLAMA_RERANK_TIMEOUT_MS,
    );

    const jobs = normaliseJobs(result);
    return jobs.length ? jobs : fallbackJobs;
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Ollama job ranking failed.");
    return fallbackJobs;
  }
}
