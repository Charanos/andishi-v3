import { AppShell } from "@/components/dashboard/app-shell";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="developer">{children}</AppShell>;
}
