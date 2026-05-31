import { NextResponse } from "next/server";
import { findJobsWithOllama, analyzeResumeWithOllama } from "@/lib/ollama";
import { extractResumeText } from "@/lib/resume-text";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Send the resume and profile fields as multipart/form-data." },
      { status: 400 },
    );
  }

  const resumeFile = formData.get("resume");
  const name = String(formData.get("name") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const preferredCities = formData
    .getAll("preferredCities")
    .map((city) => String(city).trim())
    .filter(Boolean);

  if (!(resumeFile instanceof File)) {
    return NextResponse.json({ error: "Upload a resume file." }, { status: 400 });
  }

  if (!name || !mobile || !preferredCities.length) {
    return NextResponse.json({ error: "Name, mobile number, and preferred cities are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to save an analysis." }, { status: 401 });
  }

  let resumeText: string;
  try {
    resumeText = await extractResumeText(resumeFile);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read resume." },
      { status: 400 },
    );
  }

  if (resumeText.length < 100) {
    return NextResponse.json({ error: "The resume text is too short to analyze." }, { status: 400 });
  }

  let resumeAnalysis;
  let jobs;
  try {
    resumeAnalysis = await analyzeResumeWithOllama({
      name,
      mobile,
      preferredCities,
      resumeText,
    });
    jobs = await findJobsWithOllama(resumeAnalysis, preferredCities);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ollama analysis failed." },
      { status: 502 },
    );
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      candidate_name: name,
      mobile_number: mobile,
      preferred_cities: preferredCities,
      resume_name: resumeFile.name,
      resume_text: resumeText,
      skills: resumeAnalysis.skills,
      years_of_experience: resumeAnalysis.years_of_experience,
      seniority_level: resumeAnalysis.seniority_level,
      technologies: resumeAnalysis.technologies,
      leadership_experience: resumeAnalysis.leadership_experience,
      model_name: process.env.OLLAMA_MODEL || "kimi-k2.5:cloud",
      analysis_payload: resumeAnalysis,
    })
    .select("id")
    .single();

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
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
          analysis_id: analysis.id,
          user_id: user.id,
          ...job,
          source: "ollama",
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
        analysis_id: analysis.id,
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
    analysis_id: analysis.id,
    resume_analysis: resumeAnalysis,
    jobs,
    inserted_jobs: newJobs.length,
    skipped_duplicates: jobs.length - newJobs.length,
  });
}
