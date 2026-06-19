export type UserRole = "admin" | "client" | "developer";

export type AuthUserStatus = "active" | "invited" | "disabled";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  status: AuthUserStatus;
  organizationId?: string;
  engineerId?: string;
  lastLoginAt?: string;
  createdAt: string;
};

export const roleHome: Record<UserRole, string> = {
  admin: "/admin",
  client: "/dashboard",
  developer: "/dev",
};

export const roleNames: Record<UserRole, string> = {
  admin: "Super Admin",
  client: "Client Workspace",
  developer: "Developer Workspace",
};

export function isUserRole(value: string | undefined): value is UserRole {
  return value === "admin" || value === "client" || value === "developer";
}
