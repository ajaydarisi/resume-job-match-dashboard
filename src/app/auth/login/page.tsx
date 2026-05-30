import { AuthForm } from "@/components/auth-form";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">Resume match</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to your dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Store resume analysis runs, track matched Bengaluru roles, and open apply or contact links directly.
        </p>
        {!configured ? (
          <div className="mt-6 rounded-md border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Add Supabase values to <code>.env.local</code> before signing in.
          </div>
        ) : (
          <AuthForm />
        )}
      </section>
    </main>
  );
}
