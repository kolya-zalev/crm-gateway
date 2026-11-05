import { Controller, Get } from "@nestjs/common";
import { RequirePermissions } from "../auth/permissions.decorator";
import { permissions, roles, rolePermissions } from "@crm/shared";
import type { RoleInfo } from "@crm/shared";

@Controller("api/roles")
export class RolesController {
  @Get()
  @RequirePermissions(permissions.roleRead)
  findAll(): RoleInfo[] {
    return roles.map((role) => ({
      role,
      permissions: [...rolePermissions[role]],
    }));
  }
}
