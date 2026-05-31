import type { JobMatch, ResumeAnalysis } from "@/lib/types";

const skillCatalog = [
  "React",
  "ReactJS",
  "Next.js",
  "NextJS",
  "Node.js",
  "NodeJS",
  "NestJS",
  "ExpressJS",
  "TypeScript",
  "JavaScript",
  "PostgreSQL",
  "Supabase",
  "REST APIs",
  "Microservices",
  "Stripe",
  "PayPal",
  "Razorpay",
  "Docker",
  "AWS",
  "Jenkins",
  "Tailwind CSS",
  "Zustand",
  "TanStack Query",
  "Keycloak",
  "Supabase Auth",
  "Figma",
  "JIRA",
];

const focusSkills = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "PostgreSQL",
  "Supabase",
  "Payment Systems",
  "Microservices",
];

const JOB_FETCH_TIMEOUT_MS = 8_000;

export type SourceJob = {
  company: string;
  title: string;
  location: string;
  salary?: string;
  apply_url: string;
  description: string;
};

const curatedJobs: SourceJob[] = [
  {
    company: "Narvar",
    title: "Senior Software Engineer, Fullstack",
    location: "Bengaluru, Karnataka, India",
    apply_url: "https://job-boards.greenhouse.io/narvar/jobs/7573839",
    description:
      "Full-stack role using Node.js, React, PostgreSQL, APIs, customer-facing products, scale, and distributed services.",
  },
  {
    company: "Pearson",
    title: "Software Engineer III",
    location: "Bengaluru, Karnataka, India",
    apply_url: "https://in.indeed.com/viewjob?jk=b1d723005b413d61",
    description:
      "Software Engineer III with React, Next.js, Node.js, TypeScript, reusable frameworks, APIs, cloud-native development, and microservices.",
  },
  {
    company: "A.P. Moller - Maersk",
    title: "Senior Software Engineer - Front End Engineer Next Js & React Js",
    location: "Yelahanka, Bengaluru, Karnataka, India",
    apply_url:
      "https://builtinbengaluru.in/job/senior-software-engineer-front-end-engineer-next-js-react-js/8191487",
    description:
      "Next.js, React.js, Node.js, PostgreSQL, scalable portal UI, testing, cloud deployment, and enterprise workflows.",
  },
  {
    company: "VINPRO.TODAY",
    title: "Senior Software Engineer II - Node.js/Next.js",
    location: "Bangalore, India",
    apply_url: "https://www.hirist.tech/j/senior-software-engineer-ii-node-js-next-js-1582498",
    description:
      "Next.js, React, Node.js, Express, TypeScript, PostgreSQL, REST, GraphQL, Redis, CI/CD, Docker, AWS, and serverless.",
  },
  {
    company: "Pyro AI",
    title: "Full Stack Developer",
    location: "Bengaluru, India",
    apply_url: "https://wellfound.com/jobs/3851904-full-stack-developer",
    description:
      "Full-stack product role with Next.js, PostgreSQL, Supabase, schema design, APIs, and performance-focused product building.",
  },
  {
    company: "Booking Holdings",
    title: "Fullstack Software Engineer-II",
    location: "Bengaluru, Karnataka, India",
    apply_url:
      "https://in.linkedin.com/jobs/view/fullstack-software-engineer-ii-at-booking-holdings-nasdaq-bkng-4412980898",
    description:
      "Software Engineer II full-stack role with React, TypeScript, backend systems, fraud platform, and global scale.",
  },
  {
    company: "Vegapay",
    title: "Software Development Engineer - Frontend",
    location: "Bengaluru, Karnataka, India",
    apply_url:
      "https://in.linkedin.com/jobs/view/software-development-engineer-frontend-at-vegapay-4377236905",
    description:
      "Fintech role for React, TypeScript, payment infrastructure, dashboards, component quality, and frontend platform work.",
  },
  {
    company: "Okta",
    title: "Staff Software Engineer - Node.js",
    location: "Bengaluru, Karnataka, India",
    apply_url: "https://builtin.com/job/staff-software-engineer/8581572",
    description:
      "Staff Node.js role with TypeScript, PostgreSQL, React, distributed systems, identity, security, Redis, MongoDB, mentoring, and architecture.",
  },
];

const companyDomains: Record<string, string> = {
  Narvar: "narvar.com",
  Pearson: "pearson.com",
  "A.P. Moller - Maersk": "maersk.com",
  "VINPRO.TODAY": "vinpro.today",
  "Pyro AI": "pyro.ai",
  "Booking Holdings": "bookingholdings.com",
  Vegapay: "vegapay.tech",
  Okta: "okta.com",
};

function normaliseSkill(skill: string) {
  return skill
    .replace("ReactJS", "React")
    .replace("NextJS", "Next.js")
    .replace("NodeJS", "Node.js");
}

export function analyzeResume(resumeText: string): ResumeAnalysis {
  const text = resumeText.toLowerCase();
  const skills = Array.from(
    new Set(
      skillCatalog
        .filter((skill) => text.includes(skill.toLowerCase()))
        .map(normaliseSkill),
    ),
  ).sort();

  const leadership: string[] = [];
  const ledTeam = resumeText.match(/led a ([^.]+team[^.]*)/i);
  if (ledTeam) {
    leadership.push(`Led a ${ledTeam[1].trim()}`);
  }
  if (text.includes("team management")) {
    leadership.push("Explicit team management experience");
  }
  if (text.includes("improve code quality across the team")) {
    leadership.push("Improved code quality across the team using AI coding agents");
  }

  return {
    skills,
    years_of_experience: text.includes("3 years") ? "3 years 5 months" : "3+ years",
    seniority_level:
      "Software Engineer II / Software Engineer III fit; early Senior Software Engineer for strong full-stack roles; Staff Engineer is a stretch",
    technologies: skills.filter((skill) => !["Figma", "JIRA"].includes(skill)),
    leadership_experience: leadership.length
      ? leadership
      : ["Shows ownership and cross-functional delivery; add more quantified leadership examples for senior roles"],
  };
}

function inferMissingSkills(description: string, resumeSkills: string[]) {
  const descriptionSkills = [
    "GraphQL",
    "Redis",
    "MongoDB",
    "AWS",
    "Cypress",
    "Playwright",
    "Serverless",
    "Microservices",
    "Distributed Systems",
    "Java",
  ].filter((skill) => description.toLowerCase().includes(skill.toLowerCase()));

  const owned = new Set(resumeSkills.map((skill) => skill.toLowerCase()));
  return descriptionSkills.filter((skill) => !owned.has(skill.toLowerCase()));
}

function scoreJob(job: SourceJob, resumeAnalysis: ResumeAnalysis) {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  const resumeSkills = resumeAnalysis.skills.map((skill) => skill.toLowerCase());
  const matchedFocus = focusSkills.filter((skill) => {
    if (skill === "Payment Systems") {
      return /payment|stripe|paypal|razorpay|gateway|fintech/.test(haystack);
    }
    return haystack.includes(skill.toLowerCase()) && resumeSkills.includes(skill.toLowerCase());
  });

  const isStaff = /staff/i.test(job.title);
  const isSenior = /senior|iii/i.test(job.title);
  const seniorityPenalty = isStaff ? 18 : isSenior ? 7 : 0;
  const leadershipBonus = resumeAnalysis.leadership_experience.length > 1 ? 5 : 0;
  const paymentBonus = /payment|fintech|stripe|paypal|gateway/i.test(job.description) ? 6 : 0;

  return Math.max(
    45,
    Math.min(96, 58 + matchedFocus.length * 6 + leadershipBonus + paymentBonus - seniorityPenalty),
  );
}

function contactFor(company: string) {
  const domain = companyDomains[company];
  const query = encodeURIComponent(`${company} recruiter Bengaluru software engineer`);

  return {
    contact_email: domain ? `careers@${domain}` : null,
    contact_linkedin: `https://www.linkedin.com/search/results/people/?keywords=${query}`,
    contact_reason:
      "Start with Bengaluru technical recruiters, talent acquisition partners, or engineering managers connected to this role.",
  };
}

export function scoreJobs(jobs: SourceJob[], resumeAnalysis: ResumeAnalysis): JobMatch[] {
  return jobs
    .map((job) => {
      const missing = inferMissingSkills(job.description, resumeAnalysis.skills);
      const score = scoreJob(job, resumeAnalysis) - Math.min(10, missing.length * 2);
      const matched = focusSkills.filter((skill) => job.description.toLowerCase().includes(skill.toLowerCase()));

      return {
        company: job.company,
        title: job.title,
        location: job.location,
        salary: job.salary ?? "Not disclosed",
        match_score: score,
        reason: `Matches ${matched.length ? matched.join(", ") : "full-stack web engineering"} with relevant CRM, payments, and team ownership experience.`,
        missing_skills: missing,
        apply_url: job.apply_url,
        ...contactFor(job.company),
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}

export async function fetchLiveJobs(preferredCities: string[] = ["Bengaluru"]): Promise<SourceJob[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return curatedJobs;
  }

  const cities = preferredCities.length ? preferredCities.join(" OR ") : "Bengaluru";
  const query = encodeURIComponent(
    `("Software Engineer II" OR "Software Engineer III" OR "Senior Software Engineer" OR "Full Stack Engineer") React Next.js Node TypeScript PostgreSQL (${cities})`,
  );
  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1&country=in&date_posted=month`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(JOB_FETCH_TIMEOUT_MS),
    },
  ).catch(() => null);

  if (!response?.ok) {
    return curatedJobs;
  }

  const json = (await response.json()) as {
    data?: Array<{
      employer_name?: string;
      job_title?: string;
      job_city?: string;
      job_state?: string;
      job_country?: string;
      job_apply_link?: string;
      job_description?: string;
      job_min_salary?: number;
      job_max_salary?: number;
      job_salary_currency?: string;
    }>;
  };

  const liveJobs =
    json.data?.map((job) => ({
      company: job.employer_name ?? "Unknown company",
      title: job.job_title ?? "Software Engineer",
      location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || "Bengaluru, India",
      salary:
        job.job_min_salary && job.job_max_salary
          ? `${job.job_salary_currency ?? ""} ${job.job_min_salary}-${job.job_max_salary}`
          : "Not disclosed",
      apply_url: job.job_apply_link ?? "#",
      description: job.job_description ?? "",
    })) ?? [];

  return liveJobs.length ? liveJobs : curatedJobs;
}
