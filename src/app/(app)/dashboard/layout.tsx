import { AppShell } from "@/components/dashboard/shell/app-shell";
import { requireRole } from "@/lib/auth/session";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("client");

  return <AppShell user={user}>{children}</AppShell>;
}
