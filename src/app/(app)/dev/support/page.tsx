import { SupportWorkspacePage } from "@/components/dashboard/shared/support-workspace-page";
import { requireRole } from "@/lib/auth/session";

export default async function DeveloperSupportPage() {
  const user = await requireRole("developer");

  return <SupportWorkspacePage user={user} />;
}
