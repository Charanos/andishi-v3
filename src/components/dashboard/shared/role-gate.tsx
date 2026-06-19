import type { AuthUser, UserRole } from "@/types/auth";

export function RoleGate({
  allow,
  children,
  fallback = null,
  user,
}: {
  allow: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  user: AuthUser;
}) {
  const roles = Array.isArray(allow) ? allow : [allow];

  return roles.includes(user.role) ? children : fallback;
}
