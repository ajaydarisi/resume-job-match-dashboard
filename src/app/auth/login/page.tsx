import { AuthForm } from "@/components/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.18em] text-primary">Resume match</p>
          <CardTitle className="text-3xl">Sign in to your dashboard</CardTitle>
          <CardDescription>
            Store resume analysis runs, track matched Bengaluru roles, and open apply or contact links directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <Alert>
              <AlertDescription>
                Add Supabase values to <code>.env.local</code> before signing in.
              </AlertDescription>
            </Alert>
          ) : (
            <AuthForm />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
