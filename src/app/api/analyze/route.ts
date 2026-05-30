import { NextResponse } from "next/server";
import { analyzeResume, fetchLiveJobs, scoreJobs } from "@/lib/analyzer";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { resumeText, resumeName } = (await request.json()) as {
    resumeText?: string;
    resumeName?: string;
  };

  if (!resumeText || resumeText.trim().length < 100) {
    return NextResponse.json({ error: "Paste at least 100 characters of resume text." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to save an analysis." }, { status: 401 });
  }

  const resumeAnalysis = analyzeResume(resumeText);
  const jobs = scoreJobs(await fetchLiveJobs(), resumeAnalysis);

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      resume_name: resumeName ?? "Pasted resume",
      resume_text: resumeText,
      skills: resumeAnalysis.skills,
      years_of_experience: resumeAnalysis.years_of_experience,
      seniority_level: resumeAnalysis.seniority_level,
      technologies: resumeAnalysis.technologies,
      leadership_experience: resumeAnalysis.leadership_experience,
    })
    .select("id")
    .single();

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  const { error: jobsError } = await supabase.from("job_matches").insert(
    jobs.map((job) => ({
      analysis_id: analysis.id,
      user_id: user.id,
      ...job,
      raw_payload: job,
    })),
  );

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  return NextResponse.json({
    analysis_id: analysis.id,
    resume_analysis: resumeAnalysis,
    jobs,
  });
}
