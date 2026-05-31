import { NextResponse } from "next/server";
import { findJobsWithOllama } from "@/lib/ollama";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to refetch jobs." }, { status: 401 });
  }

  const { data: latestAnalysis, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id, skills, years_of_experience, seniority_level, technologies, leadership_experience, preferred_cities, analysis_payload",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  if (!latestAnalysis) {
    return NextResponse.json({ error: "Analyze a resume before refetching jobs." }, { status: 400 });
  }

  const resumeAnalysis = {
    skills: latestAnalysis.skills,
    years_of_experience: latestAnalysis.years_of_experience,
    seniority_level: latestAnalysis.seniority_level,
    technologies: latestAnalysis.technologies,
    leadership_experience: latestAnalysis.leadership_experience,
    summary:
      latestAnalysis.analysis_payload &&
      typeof latestAnalysis.analysis_payload === "object" &&
      "summary" in latestAnalysis.analysis_payload
        ? String(latestAnalysis.analysis_payload.summary)
        : undefined,
  };

  let jobs;
  try {
    jobs = await findJobsWithOllama(resumeAnalysis, latestAnalysis.preferred_cities ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ollama job refetch failed." },
      { status: 502 },
    );
  }

  const { data: existingJobs, error: existingJobsError } = await supabase
    .from("job_matches")
    .select("apply_url")
    .eq("user_id", user.id);

  if (existingJobsError) {
    return NextResponse.json({ error: existingJobsError.message }, { status: 500 });
  }

  const existingUrls = new Set((existingJobs ?? []).map((job) => job.apply_url));
  const newJobs = jobs.filter((job) => !existingUrls.has(job.apply_url));

  const { error: jobsError } = newJobs.length
    ? await supabase.from("job_matches").insert(
        newJobs.map((job) => ({
          analysis_id: latestAnalysis.id,
          user_id: user.id,
          ...job,
          source: "ollama-refetch",
          raw_payload: job,
        })),
      )
    : { error: null };

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  if (newJobs.length) {
    const { error: applicationsError } = await supabase.from("applications").insert(
      newJobs.map((job) => ({
        analysis_id: latestAnalysis.id,
        user_id: user.id,
        company: job.company,
        title: job.title,
        location: job.location,
        salary: job.salary,
        match_score: job.match_score,
        apply_url: job.apply_url,
        priority: job.match_score >= 90 ? "high" : job.match_score < 70 ? "low" : "normal",
        next_action: job.match_score >= 90 ? "Apply while the match is hot" : "Review fit and tailor resume",
        raw_payload: job,
      })),
    );

    if (applicationsError) {
      return NextResponse.json({ error: applicationsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    jobs,
    inserted_jobs: newJobs.length,
    skipped_duplicates: jobs.length - newJobs.length,
  });
}
