import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceView =
  | "dashboard"
  | "resume"
  | "discovery"
  | "tracker"
  | "assistant"
  | "analytics"
  | "settings";

export type AnalysisRow = {
  id: string;
  candidate_name: string | null;
  mobile_number: string | null;
  preferred_cities: string[];
  skills: string[];
  years_of_experience: string;
  seniority_level: string;
  technologies: string[];
  leadership_experience: string[];
  analysis_payload?: { summary?: string } | null;
  created_at: string;
};

export type JobRow = {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  match_score: number;
  reason: string;
  missing_skills: string[];
  apply_url: string;
  contact_email: string | null;
  contact_linkedin: string | null;
  contact_reason: string | null;
  created_at?: string;
};

export type ApplicationRow = {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  match_score: number;
  apply_url: string;
  status: string;
  priority: string;
  next_action: string | null;
  next_action_at: string | null;
  updated_at: string;
};

export type WorkspaceData = {
  analysis: AnalysisRow | null;
  applications: ApplicationRow[];
  jobs: JobRow[];
  userEmail?: string;
  configured: boolean;
  authenticated: boolean;
};

export const demoAnalysis: AnalysisRow = {
  id: "demo-analysis",
  candidate_name: "Ajay Darisi",
  mobile_number: "8328031546",
  preferred_cities: ["Bengaluru", "Hyderabad", "Remote"],
  skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Supabase"],
  years_of_experience: "3+ years",
  seniority_level: "Software Engineer II / Senior Software Engineer track",
  technologies: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Supabase"],
  leadership_experience: ["Led CRM delivery across cross-functional teams", "Owned reusable payments and registration systems"],
  analysis_payload: {
    summary:
      "Strategic full-stack engineer with strong product delivery, payments, CRM, and platform ownership signals. Best matched to senior product engineering roles where React, Node.js, PostgreSQL, and Supabase experience can translate into immediate impact.",
  },
  created_at: new Date().toISOString(),
};

export const demoJobs: JobRow[] = [
  {
    id: "demo-job-1",
    company: "Linear Systems",
    title: "Senior Product Engineer",
    location: "Bengaluru (Remote)",
    salary: "INR 45L - INR 65L",
    match_score: 98,
    reason: "Strong overlap with React, Node.js, product ownership, and platform engineering.",
    missing_skills: ["GraphQL", "Redis"],
    apply_url: "https://www.linkedin.com/jobs/search/",
    contact_email: "careers@example.com",
    contact_linkedin: "https://www.linkedin.com/search/results/people/?keywords=recruiter",
    contact_reason: "Find product engineering recruiters connected to this role.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-job-2",
    company: "Stripe India",
    title: "Backend Architecture Lead",
    location: "Bengaluru (Hybrid)",
    salary: "INR 55L - INR 80L",
    match_score: 94,
    reason: "Payments and platform delivery experience maps well to backend product infrastructure.",
    missing_skills: ["Go", "AWS", "Redis"],
    apply_url: "https://www.linkedin.com/jobs/search/",
    contact_email: null,
    contact_linkedin: "https://www.linkedin.com/search/results/people/?keywords=stripe%20recruiter",
    contact_reason: "Search for India engineering recruiters.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-job-3",
    company: "Arc Browser",
    title: "Fullstack Engineer",
    location: "Remote",
    salary: "INR 40L - INR 55L",
    match_score: 82,
    reason: "Full-stack profile fits product velocity and UI platform ownership.",
    missing_skills: ["Tailwind", "Testing"],
    apply_url: "https://www.linkedin.com/jobs/search/",
    contact_email: null,
    contact_linkedin: null,
    contact_reason: null,
    created_at: new Date().toISOString(),
  },
];

export const demoApplications: ApplicationRow[] = [
  {
    id: "demo-app-1",
    company: "Linear Systems",
    title: "Senior Product Engineer",
    location: "Bengaluru (Remote)",
    salary: "INR 45L - INR 65L",
    match_score: 98,
    apply_url: "https://www.linkedin.com/jobs/search/",
    status: "saved",
    priority: "high",
    next_action: "Tailor resume and apply today",
    next_action_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-app-2",
    company: "Stripe India",
    title: "Backend Architecture Lead",
    location: "Bengaluru (Hybrid)",
    salary: "INR 55L - INR 80L",
    match_score: 94,
    apply_url: "https://www.linkedin.com/jobs/search/",
    status: "applied",
    priority: "high",
    next_action: "Follow up with recruiter",
    next_action_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-app-3",
    company: "Databricks",
    title: "Infrastructure Engineer",
    location: "Bengaluru",
    salary: "Not disclosed",
    match_score: 84,
    apply_url: "https://www.linkedin.com/jobs/search/",
    status: "oa_scheduled",
    priority: "critical",
    next_action: "Prepare for online assessment",
    next_action_at: null,
    updated_at: new Date().toISOString(),
  },
];

export function demoWorkspaceData(): WorkspaceData {
  return {
    analysis: demoAnalysis,
    applications: demoApplications,
    jobs: demoJobs,
    userEmail: "demo@techmatch.ai",
    configured: false,
    authenticated: true,
  };
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  if (!isSupabaseConfigured()) {
    return demoWorkspaceData();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { analysis: null, applications: [], jobs: [], configured: true, authenticated: false };
  }

  const { data: latestAnalysis } = await supabase
    .from("analyses")
    .select(
      "id, candidate_name, mobile_number, preferred_cities, skills, years_of_experience, seniority_level, technologies, leadership_experience, analysis_payload, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: jobs } = latestAnalysis
    ? await supabase
        .from("job_matches")
        .select(
          "id, company, title, location, salary, match_score, reason, missing_skills, apply_url, contact_email, contact_linkedin, contact_reason, created_at",
        )
        .eq("user_id", user.id)
        .order("match_score", { ascending: false })
    : { data: [] };

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, company, title, location, salary, match_score, apply_url, status, priority, next_action, next_action_at, updated_at",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return {
    analysis: (latestAnalysis ?? null) as AnalysisRow | null,
    applications: (applications ?? []) as ApplicationRow[],
    jobs: (jobs ?? []) as JobRow[],
    userEmail: user.email,
    configured: true,
    authenticated: true,
  };
}
