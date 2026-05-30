# Resume Job Match Dashboard

Next.js dashboard for resume/job matching with Supabase Auth and Supabase-backed analysis storage.

## Features

- Supabase email auth
- Resume analysis for skills, seniority, technologies, and leadership signals
- Bengaluru job matching for React, Next.js, Node.js, TypeScript, PostgreSQL, Supabase, payment systems, and microservices
- Match score, missing skills, apply link, recruiter email/linkedin contact suggestions
- Supabase migration with RLS policies per authenticated user
- Optional live job search through RapidAPI JSearch when `RAPIDAPI_KEY` is configured

## Setup

1. Create a Supabase project and run `supabase/migrations/0001_resume_job_match.sql`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Run:

```bash
npm install
npm run dev
```

## Deploy

Set the same environment variables in Vercel and deploy this repository.
