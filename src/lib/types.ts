export type ResumeAnalysis = {
  skills: string[];
  years_of_experience: string;
  seniority_level: string;
  technologies: string[];
  leadership_experience: string[];
};

export type JobMatch = {
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

export type AnalysisResponse = {
  analysis_id: string | null;
  resume_analysis: ResumeAnalysis;
  jobs: JobMatch[];
};
