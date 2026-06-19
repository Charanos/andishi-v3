import { AdminProfilePage as AdminProfileWorkspace } from "@/components/dashboard/admin/admin-profile-page";
import { requireRole } from "@/lib/auth/session";

export default async function AdminProfilePage() {
  const user = await requireRole("admin");

  return <AdminProfileWorkspace user={user} />;
}
