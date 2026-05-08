import { AppShell } from "@/components/dashboard/app-shell";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="client">{children}</AppShell>;
}
