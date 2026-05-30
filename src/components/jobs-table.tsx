import { Contact, ExternalLink, Mail } from "lucide-react";

type Row = {
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
};

export function JobsTable({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return (
      <section className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
        <h2 className="text-lg font-semibold text-white">No saved job matches yet</h2>
        <p className="mt-2 text-sm text-slate-300">Run the analysis to populate the dashboard table.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.07] text-xs uppercase tracking-[0.12em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Salary</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Missing</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-white/[0.035]">
                <td className="px-4 py-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300 font-bold text-slate-950">
                    {row.match_score}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-white">{row.company}</td>
                <td className="px-4 py-4 text-slate-100">{row.title}</td>
                <td className="px-4 py-4 text-slate-300">{row.location}</td>
                <td className="px-4 py-4 text-slate-300">{row.salary}</td>
                <td className="max-w-sm px-4 py-4 leading-6 text-slate-300">{row.reason}</td>
                <td className="px-4 py-4">
                  {row.missing_skills.length ? (
                    <div className="flex max-w-xs flex-wrap gap-1.5">
                      {row.missing_skills.map((skill) => (
                        <span key={skill} className="rounded bg-amber-300/15 px-2 py-1 text-xs text-amber-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">None obvious</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <a
                      href={row.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-950 hover:bg-slate-200"
                    >
                      Apply <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {row.contact_email ? (
                      <a
                        href={`mailto:${row.contact_email}?subject=${encodeURIComponent(`${row.title} at ${row.company}`)}`}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs text-slate-100 hover:bg-white/10"
                        title={row.contact_reason ?? undefined}
                      >
                        Email <Mail className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    {row.contact_linkedin ? (
                      <a
                        href={row.contact_linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs text-slate-100 hover:bg-white/10"
                        title={row.contact_reason ?? undefined}
                      >
                        LinkedIn <Contact className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
