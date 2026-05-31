import {
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Grid2X2,
  HelpCircle,
  Layers3,
  LogOut,
  Search,
  Settings,
  Share2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import Link from "next/link";
import { AnalyzePanel } from "@/components/analyze-panel";
import { RefetchJobsButton } from "@/components/refetch-jobs-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalysisRow, ApplicationRow, JobRow, WorkspaceView } from "@/lib/workspace-data";

type WorkspaceDashboardProps = {
  analysis: AnalysisRow | null;
  applications: ApplicationRow[];
  jobs: JobRow[];
  selectedJobId?: string;
  userEmail?: string;
  view?: WorkspaceView | "job-details";
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { key: "resume", label: "Resume Analysis", href: "/resume-analysis", icon: FileText },
  { key: "discovery", label: "Job Discovery", href: "/job-discovery", icon: Search },
  { key: "tracker", label: "Tracker", href: "/tracker", icon: ClipboardList },
  { key: "assistant", label: "AI Assistant", href: "/assistant", icon: Bot },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];

const trackerColumns = [
  { key: "saved", label: "Saved", tone: "bg-muted-foreground" },
  { key: "applied", label: "Applied", tone: "bg-primary" },
  { key: "oa_scheduled", label: "OA Scheduled", tone: "bg-amber-300" },
  { key: "interviewing", label: "Interviewing", tone: "bg-sky-300" },
  { key: "offer", label: "Offer", tone: "bg-emerald-300" },
];

function averageScore(rows: Array<{ match_score: number }>) {
  if (!rows.length) {
    return 0;
  }

  return Math.round(rows.reduce((sum, row) => sum + row.match_score, 0) / rows.length);
}

function scoreTone(score: number) {
  if (score >= 90) {
    return "border-emerald-400/35 bg-emerald-400/15 text-emerald-200";
  }

  if (score >= 75) {
    return "border-amber-300/35 bg-amber-300/15 text-amber-200";
  }

  return "border-slate-400/25 bg-slate-400/10 text-slate-200";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function toApplications(jobs: JobRow[], applications: ApplicationRow[]) {
  if (applications.length) {
    return applications;
  }

  return jobs.map((job) => ({
    id: job.id,
    company: job.company,
    title: job.title,
    location: job.location,
    salary: job.salary,
    match_score: job.match_score,
    apply_url: job.apply_url,
    status: "saved",
    priority: job.match_score >= 90 ? "high" : "normal",
    next_action: job.match_score >= 90 ? "Apply while the match is hot" : "Review fit and tailor resume",
    next_action_at: null,
    updated_at: job.created_at ?? new Date().toISOString(),
  }));
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card size="sm" className="min-h-24">
      <CardContent className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function Sidebar({ activeView }: { activeView: WorkspaceDashboardProps["view"] }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-background px-4 py-6 lg:flex">
      <div className="px-2">
        <h1 className="text-2xl font-bold text-primary">TechMatch AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">Intelligent Career Matcher</p>
      </div>
      <nav className="mt-10 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key || (activeView === "job-details" && item.key === "discovery");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-muted text-primary ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Button asChild className="mb-4 w-full">
        <Link href="/resume-analysis">
          <Sparkles className="h-4 w-4" />
          New Application
        </Link>
      </Button>
      <Separator className="mb-4" />
      <div className="space-y-1">
        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70" href="#help">
          <HelpCircle className="h-4 w-4" />
          Help Center
        </a>
        <form action="/auth/logout" method="post">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}

function TopBar({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:ml-72 lg:px-8">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-lg border border-border bg-muted/50 px-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Search jobs, roles, or companies..."
        />
      </div>
      <div className="ml-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
            {(userEmail?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{userEmail?.split("@")[0] ?? "Profile"}</p>
            <p className="text-xs uppercase text-muted-foreground">Software Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MatchCurve({ score }: { score: number }) {
  const endX = Math.max(60, Math.min(340, 80 + score * 2.7));
  return (
    <Card className="min-h-[360px] lg:col-span-2" id="dashboard">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl">Match Score Distribution</CardTitle>
          <CardDescription>Visualizing compatibility across current recommendations.</CardDescription>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 overflow-hidden rounded-lg bg-background/60 p-4 ring-1 ring-border">
          <svg className="h-full w-full" viewBox="0 0 420 220" role="img" aria-label="Match score curve">
            <defs>
              <linearGradient id="matchFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M20 180 C90 170 130 132 180 112 C235 90 260 150 300 126 C330 108 348 64 ${endX} 76`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            <path
              d={`M20 180 C90 170 130 132 180 112 C235 90 260 150 300 126 C330 108 348 64 ${endX} 76 L${endX} 210 L20 210 Z`}
              fill="url(#matchFill)"
              className="text-primary"
            />
            {[80, 180, 300, endX].map((x, index) => (
              <circle key={x} cx={x} cy={[152, 112, 126, 76][index]} r="4" className="fill-primary" />
            ))}
          </svg>
          <div className="absolute bottom-4 left-6 right-6 flex justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardOverview({
  analysis,
  jobs,
  applications,
}: {
  analysis: AnalysisRow | null;
  jobs: JobRow[];
  applications: ApplicationRow[];
}) {
  const avgMatch = averageScore(jobs);
  const applied = applications.filter((item) => item.status !== "saved").length;
  const interviews = applications.filter((item) => item.status === "interviewing" || item.status === "oa_scheduled").length;
  const topJob = jobs[0];
  const highMatchCount = jobs.filter((job) => job.match_score >= 85).length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Jobs" value={String(jobs.length || 0)} detail="Saved recommendations" icon={Briefcase} />
        <MetricCard label="New Today" value={String(jobs.slice(0, 3).length)} detail="Fresh active roles" icon={Zap} />
        <MetricCard label="Avg Match" value={`${avgMatch || 0}%`} detail="Compatibility score" icon={Gauge} />
        <MetricCard label="Applied" value={String(applied)} detail="Tracked applications" icon={CheckCircle2} />
        <MetricCard label="Interviews" value={String(interviews)} detail="Upcoming stages" icon={CalendarClock} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <MatchCurve score={avgMatch || 84} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bot className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Skill match alert</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your {analysis?.technologies?.[0] ?? "React"} profile is strongest for product engineering roles in{" "}
                {analysis?.preferred_cities?.[0] ?? "Bengaluru"}.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Salary insight</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                High-match roles with your stack are clustering around senior full-stack and platform teams.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Optimized resume</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Highlight distributed systems and ownership metrics to unlock more 90%+ matches.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/resume-analysis">View detailed analysis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Apply</CardTitle>
              <CardDescription>{highMatchCount} high-match roles ready.</CardDescription>
            </div>
            <Badge>{highMatchCount} high match</Badge>
          </CardHeader>
          <CardContent>
            {topJob ? (
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{topJob.company} - {topJob.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{topJob.match_score}% match - 1-click apply available</p>
                </div>
                <Button asChild>
                  <a href={topJob.apply_url} target="_blank" rel="noreferrer">
                    Apply now
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Analyze your resume to generate quick-apply roles.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Action Needed</CardTitle>
            <Badge variant="destructive">Critical</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <Target className="mt-1 h-5 w-5 text-amber-200" />
              <div>
                <p className="font-semibold">Update profile signals</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add measurable architecture, cloud, and mentoring outcomes before applying to senior roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ResumeAnalysisPanel({ analysis }: { analysis: AnalysisRow | null }) {
  if (!analysis) {
    return (
      <section id="resume" className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold">Resume Analysis</h2>
          <p className="mt-1 text-muted-foreground">Upload a resume to unlock parsing, benchmarking, and recommendations.</p>
        </div>
        <AnalyzePanel />
      </section>
    );
  }

  const summary =
    analysis.analysis_payload?.summary ??
    `AI parsed ${analysis.candidate_name ?? "your"} profile and found a strong ${analysis.seniority_level || "software engineering"} signal.`;
  const radarItems = ["Frontend", "Backend", "Cloud", "Security", "Leadership"];
  const scores = [86, 92, 74, 68, Math.min(92, 70 + analysis.leadership_experience.length * 6)];

  return (
    <section id="resume" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Resume Analysis</h2>
          <p className="mt-1 text-muted-foreground">Advanced AI parsing and competitive benchmarking for senior roles.</p>
        </div>
        <div className="flex gap-2">
          <RefetchJobsButton />
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button>
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>
      <AnalyzePanel />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-lg leading-8 text-muted-foreground">{summary}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Experience</p>
                <p className="mt-2 text-2xl font-semibold">{analysis.years_of_experience}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tech Stack</p>
                <p className="mt-2 text-sm font-semibold">{analysis.technologies.slice(0, 3).join(" + ") || "Profile pending"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Leadership</p>
                <p className="mt-2 text-2xl font-semibold">{analysis.leadership_experience.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Category Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {radarItems.map((item, index) => (
                <div key={item}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{item}</span>
                    <span className="text-muted-foreground">{scores[index]}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${scores[index]}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Target Gap Analysis</CardTitle>
              <CardDescription>Benchmark: Senior Software Engineer at Tier-1 tech.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {["Kubernetes & Orchestration", "Advanced System Design", "Go (Golang)"].map((gap, index) => (
                <div key={gap}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{gap}</span>
                    <span className={index === 0 ? "text-red-200" : index === 1 ? "text-amber-200" : "text-muted-foreground"}>
                      {index === 0 ? "High Impact" : index === 1 ? "Medium Impact" : "Optional"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {index === 0
                      ? "Essential for large-scale cloud native infrastructure."
                      : index === 1
                        ? "Deep knowledge of distributed caching and rate limiting."
                        : "Frequently requested for performance-critical services."}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function JobDiscovery({ jobs }: { jobs: JobRow[] }) {
  const visibleJobs = jobs.slice(0, 6);
  const skillFilters = ["React", "Node.js", "AWS", "Python", "Docker", "Kubernetes"];

  return (
    <section id="discovery" className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Recommended for you</h2>
        <p className="mt-1 text-muted-foreground">{jobs.length || 0} matching roles found from your latest analysis.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <Button variant="link" className="px-0">Clear all</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Location</p>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm">Bengaluru, India</div>
              <div className="mt-3 flex gap-2">
                <Badge variant="secondary">Remote</Badge>
                <Badge variant="secondary">Hybrid</Badge>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">Experience</span>
                <span className="text-primary">5 - 8 yrs</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {skillFilters.map((skill, index) => (
                  <Badge key={skill} variant={index < 3 ? "default" : "outline"} className="h-7 rounded-md">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {visibleJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <Badge variant="outline" className={scoreTone(job.match_score)}>
                  <Zap className="h-3 w-3" />
                  {job.match_score}% Match
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <span>{job.salary}</span>
                  <span>{job.location}</span>
                  <span>5 - 8 years</span>
                  <span>Recently posted</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.missing_skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="rounded-md">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={job.apply_url} target="_blank" rel="noreferrer">Apply Now</a>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/jobs/${job.id}`} aria-label="Open job">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrackerBoard({ applications }: { applications: ApplicationRow[] }) {
  return (
    <section id="tracker" className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Application Tracker</h2>
        <p className="mt-1 text-muted-foreground">Kanban view of saved roles and hiring stages.</p>
      </div>
      <div className="grid min-h-[520px] gap-4 overflow-x-auto pb-2 xl:grid-cols-5">
        {trackerColumns.map((column) => {
          const rows = applications.filter((item) => item.status === column.key);
          return (
            <Card key={column.key} className="min-w-72">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.14em]">
                  <span className={`h-2 w-2 rounded-full ${column.tone}`} />
                  {column.label}
                </CardTitle>
                <Badge variant="secondary">{rows.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {rows.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-muted/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.company}</p>
                        <p className="mt-2 font-semibold">{item.title}</p>
                      </div>
                      <Badge variant="outline">{item.match_score}%</Badge>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{item.next_action ?? "No action set"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Updated {formatDate(item.updated_at)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function JobDetailsPanel({ job, analysis }: { job: JobRow | undefined; analysis: AnalysisRow | null }) {
  const selectedJob = job;

  if (!selectedJob) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Job Details</h2>
          <p className="mt-1 text-muted-foreground">Select a recommendation from Job Discovery to inspect match details.</p>
        </div>
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center text-center text-muted-foreground">
            No matching job found for this route.
          </CardContent>
        </Card>
      </section>
    );
  }

  const matchedSkills = (analysis?.technologies ?? []).slice(0, 5);
  const gaps = selectedJob.missing_skills.length ? selectedJob.missing_skills : ["System Design", "Cloud Native"];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-primary">Match analysis</p>
          <h2 className="mt-2 text-3xl font-semibold">{selectedJob.title}</h2>
          <p className="mt-1 text-muted-foreground">{selectedJob.company} - {selectedJob.location}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/job-discovery">Back to discovery</Link>
          </Button>
          <Button asChild>
            <a href={selectedJob.apply_url} target="_blank" rel="noreferrer">
              Apply now <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-5 w-5 text-primary" />
              Role Fit Breakdown
            </CardTitle>
            <CardDescription>{selectedJob.reason}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Match Score" value={`${selectedJob.match_score}%`} detail="AI compatibility" icon={Gauge} />
              <MetricCard label="Salary" value={selectedJob.salary} detail="Expected range" icon={Briefcase} />
              <MetricCard label="Priority" value={selectedJob.match_score >= 90 ? "High" : "Medium"} detail="Application urgency" icon={Zap} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/35 p-4">
                <p className="text-sm font-semibold">Matched strengths</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {matchedSkills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/35 p-4">
                <p className="text-sm font-semibold">Skill gaps</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gaps.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Card className="bg-muted/25">
              <CardHeader>
                <CardTitle>AI Coaching Notes</CardTitle>
                <CardDescription>
                  Tailor the application around measurable platform ownership, customer-facing product delivery, and impact metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {["Resume bullets", "Recruiter note", "Interview prep"].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-background/40 p-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="mt-3 text-sm font-semibold">{item}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Generate a targeted version from this job description.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Plan</CardTitle>
            <CardDescription>Recommended next steps for this role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Customize resume summary", "Find hiring manager", "Prepare system design story", "Submit application"].map(
              (step, index) => (
                <div key={step} className="flex gap-3 rounded-lg border border-border bg-muted/35 p-3">
                  <Badge variant={index === 0 ? "default" : "outline"}>{index + 1}</Badge>
                  <p className="text-sm">{step}</p>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function AnalyticsPanel({ jobs, applications }: { jobs: JobRow[]; applications: ApplicationRow[] }) {
  const avgMatch = averageScore(jobs);
  const statusCoverage = applications.length ? Math.round((applications.filter((item) => item.status !== "saved").length / applications.length) * 100) : 0;

  return (
    <section id="analytics" className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Career Analytics</h2>
        <p className="mt-1 text-muted-foreground">Long-term trends, salary benchmarks, and momentum tracking.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pipeline Health" value={`${statusCoverage}%`} detail="Beyond saved stage" icon={Layers3} />
        <MetricCard label="Market Fit" value={`${avgMatch}%`} detail="Average job match" icon={Target} />
        <MetricCard label="AI Confidence" value={jobs.length ? "High" : "Pending"} detail="Based on latest profile" icon={Bot} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Recommendations</CardTitle>
          <CardDescription>Highest signal roles from the latest run.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Match</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.slice(0, 6).map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="px-4 font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell className="text-muted-foreground">{job.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={scoreTone(job.match_score)}>
                      {job.match_score}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/jobs/${job.id}`} aria-label={`Open ${job.title}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function SettingsPanel({ userEmail }: { userEmail?: string }) {
  return (
    <section id="settings" className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Settings</h2>
        <p className="mt-1 text-muted-foreground">Profile, alerts, and workspace preferences.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Visible identity for your career workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
              <p className="mt-2 font-semibold">{userEmail ?? "demo@techmatch.ai"}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Target role</p>
              <p className="mt-2 font-semibold">Senior Software Engineer</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>Controls that match the production design system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Daily match digest", "High-match job alerts", "Resume gap reminders"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-border bg-muted/35 p-4">
                <span className="text-sm font-medium">{item}</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function AssistantPanel() {
  return (
    <section id="assistant" className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">AI Career Assistant</h2>
        <p className="mt-1 text-muted-foreground">Coaching prompts and next-best actions generated from the profile.</p>
      </div>
      <Card>
        <CardContent className="grid gap-4 pt-4 md:grid-cols-3">
          {[
            ["Mock interview", "Practice system design for senior full-stack interviews."],
            ["Cover letter", "Generate a tailored note for the highest match role."],
            ["JD breakdown", "Convert any job description into skill gaps and prep notes."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-border bg-muted/35 p-4">
              <Bot className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function WorkspaceDashboard({
  analysis,
  applications,
  jobs,
  selectedJobId,
  userEmail,
  view = "dashboard",
}: WorkspaceDashboardProps) {
  const trackerApplications = toApplications(jobs, applications);
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const content = {
    dashboard: (
      <>
        <DashboardOverview analysis={analysis} jobs={jobs} applications={trackerApplications} />
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <Card>
            <CardHeader>
              <CardTitle>Top Matching Companies</CardTitle>
              <CardDescription>Partner-style snapshot from the current recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {jobs.slice(0, 4).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="rounded-lg border border-border bg-muted/35 p-4 transition hover:bg-muted/55"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-sm font-bold">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="mt-3 font-medium">{job.company}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{job.match_score}% match</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <AnalyticsPanel jobs={jobs} applications={trackerApplications} />
        </div>
      </>
    ),
    resume: <ResumeAnalysisPanel analysis={analysis} />,
    discovery: <JobDiscovery jobs={jobs} />,
    tracker: <TrackerBoard applications={trackerApplications} />,
    assistant: <AssistantPanel />,
    analytics: <AnalyticsPanel jobs={jobs} applications={trackerApplications} />,
    settings: <SettingsPanel userEmail={userEmail} />,
    "job-details": <JobDetailsPanel job={selectedJob} analysis={analysis} />,
  }[view];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeView={view} />
      <TopBar userEmail={userEmail} />
      <main className="space-y-12 px-4 py-6 lg:ml-72 lg:px-8">
        {content}
      </main>
    </div>
  );
}
