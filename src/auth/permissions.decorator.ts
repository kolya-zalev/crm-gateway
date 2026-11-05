import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@crm/shared";

export const permissionsKey = "permissions";
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(permissionsKey, permissions);
