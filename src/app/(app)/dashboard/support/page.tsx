import { SupportWorkspacePage } from "@/components/dashboard/shared/support-workspace-page";
import { requireRole } from "@/lib/auth/session";

export default async function ClientSupportPage() {
  const user = await requireRole("client");

  return <SupportWorkspacePage user={user} />;
}
