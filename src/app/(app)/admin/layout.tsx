import { AppShell } from "@/components/dashboard/shell/app-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return <AppShell user={user}>{children}</AppShell>;
}
