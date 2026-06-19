import { AdminUsersPage as AdminUsersWorkspace } from "@/components/dashboard/admin/admin-users-page";
import { getAdminAuthIntake } from "@/lib/dashboard/admin-auth-intake";

export default async function AdminUsersPage() {
  const authIntake = await getAdminAuthIntake(24);

  return <AdminUsersWorkspace authIntake={authIntake} />;
}
