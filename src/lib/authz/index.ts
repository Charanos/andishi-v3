export { PERMISSION_CATALOG, PERMISSION_MODULES, SYSTEM_ROLES } from "@/lib/authz/catalog";
export type {
  PermissionDefinition,
  PermissionKey,
  PermissionModule,
  SystemRoleDefinition,
} from "@/lib/authz/catalog";
export { authorize, can } from "@/lib/authz/can";
export type { AuthorizeOptions } from "@/lib/authz/can";
export { writeAudit } from "@/lib/authz/audit";
export type { WriteAuditInput } from "@/lib/authz/audit";
export {
  ConflictError,
  DomainError,
  DomainValidationError,
  ForbiddenError,
  NotFoundError,
  RateLimitedError,
  isDomainError,
} from "@/lib/authz/errors";
export type { DomainErrorCode } from "@/lib/authz/errors";
export { resolveActorPermissions } from "@/lib/authz/resolve";
export type { ActorPermissions } from "@/lib/authz/resolve";
