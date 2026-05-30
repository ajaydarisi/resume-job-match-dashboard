type Analysis = {
  candidate_name: string | null;
  mobile_number: string | null;
  preferred_cities: string[];
  skills: string[];
  years_of_experience: string;
  seniority_level: string;
  technologies: string[];
  leadership_experience: string[];
  created_at: string;
};

export function ResumeSummary({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Profile</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {analysis.candidate_name ?? "Candidate"}
        </p>
        <p className="mt-2 text-sm text-slate-300">{analysis.mobile_number ?? "Mobile not provided"}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">Experience</p>
        <p className="mt-2 text-2xl font-semibold text-white">{analysis.years_of_experience}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{analysis.seniority_level}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Leadership</p>
        <div className="mt-3 space-y-2">
          {analysis.leadership_experience.map((item) => (
            <p key={item} className="text-sm leading-6 text-slate-200">
              {item}
            </p>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4 lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Preferred Cities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.preferred_cities.map((city) => (
            <span key={city} className="rounded-md bg-cyan-300/15 px-2.5 py-1.5 text-sm text-cyan-100">
              {city}
            </span>
          ))}
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.14em] text-slate-400">Technologies</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.technologies.map((technology) => (
            <span key={technology} className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm text-slate-100">
              {technology}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
