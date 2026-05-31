import { redirect } from "next/navigation";
import { WorkspaceDashboard } from "@/components/workspace-dashboard";
import { getWorkspaceData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const data = await getWorkspaceData();

  if (data.configured && !data.authenticated) {
    redirect("/auth/login");
  }

  return <WorkspaceDashboard {...data} view="assistant" />;
}
