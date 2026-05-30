"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback` },
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your inbox to confirm your email.");
      return;
    }

    location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="text-sm text-slate-200" htmlFor="email">
          Email
        </label>
        <div className="mt-2 flex items-center rounded-md border border-white/10 bg-black/20 px-3">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-white outline-none placeholder:text-slate-500"
          placeholder="At least 6 characters"
        />
      </div>
      {message ? <p className="rounded-md bg-white/10 p-3 text-sm text-slate-100">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="w-full text-center text-sm text-cyan-100 hover:text-white"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
