import { redirect } from "next/navigation";
import { WorkspaceDashboard } from "@/components/workspace-dashboard";
import { getWorkspaceData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, data] = await Promise.all([params, getWorkspaceData()]);

  if (data.configured && !data.authenticated) {
    redirect("/auth/login");
  }

  return <WorkspaceDashboard {...data} selectedJobId={id} view="job-details" />;
}
