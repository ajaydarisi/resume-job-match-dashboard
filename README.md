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

Current Vercel project:

- Production URL: https://resume-job-match-dashboard.vercel.app
- Supabase project ref: `nkpyexpkszuuwmodshtv`
- Required Vercel env vars:
  - `NEXT_PUBLIC_SUPABASE_URL=https://nkpyexpkszuuwmodshtv.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>`
  - `RAPIDAPI_KEY=<optional live job search key>`

The database schema has already been applied to the Supabase project above. The app will show a setup screen until the publishable key is added to Vercel and the project is redeployed.
