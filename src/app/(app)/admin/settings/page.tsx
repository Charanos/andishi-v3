import { AdminSettingsPage as AdminSettingsWorkspace } from "@/components/dashboard/admin/admin-settings-page";
import { getAdminAuthIntake } from "@/lib/dashboard/admin-auth-intake";

export default async function AdminSettingsPage() {
  const authIntake = await getAdminAuthIntake();

  return <AdminSettingsWorkspace authIntake={authIntake} />;
}
