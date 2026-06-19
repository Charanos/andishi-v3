import { AppShell } from "@/components/dashboard/shell/app-shell";
import { requireRole } from "@/lib/auth/session";

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("developer");

  return <AppShell user={user}>{children}</AppShell>;
}
