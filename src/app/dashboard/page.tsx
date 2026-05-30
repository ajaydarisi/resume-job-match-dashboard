import { redirect } from "next/navigation";
import { AnalyzePanel } from "@/components/analyze-panel";
import { JobsTable } from "@/components/jobs-table";
import { ResumeSummary } from "@/components/resume-summary";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-amber-100">Setup required</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Connect Supabase to continue</h1>
          <p className="mt-3 leading-7 text-amber-50/90">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>, then run the
            migration in <code>supabase/migrations/0001_resume_job_match.sql</code>.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: latestAnalysis } = await supabase
    .from("analyses")
    .select("id, skills, years_of_experience, seniority_level, technologies, leadership_experience, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: jobs } = latestAnalysis
    ? await supabase
        .from("job_matches")
        .select(
          "id, company, title, location, salary, match_score, reason, missing_skills, apply_url, contact_email, contact_linkedin, contact_reason",
        )
        .eq("analysis_id", latestAnalysis.id)
        .order("match_score", { ascending: false })
    : { data: [] };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">Bengaluru job intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Resume Job Match Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">{user.email}</p>
        </div>
        <form action="/auth/logout" method="post">
          <button className="min-h-10 rounded-md border border-white/10 px-4 text-sm text-slate-100 hover:bg-white/10">
            Sign out
          </button>
        </form>
      </header>

      <div className="grid gap-5">
        <AnalyzePanel />
        <ResumeSummary analysis={latestAnalysis} />
        <JobsTable rows={jobs ?? []} />
      </div>
    </main>
  );
}
