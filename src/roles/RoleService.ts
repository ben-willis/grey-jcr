import Role from "./entities/Role";

export interface RoleService {
    getRoles(level?: number): Promise<Role[]>;
    getRoleById(roleId: number): Promise<Role>;
    getRoleBySlug(slug: string): Promise<Role>;
    createRole(title: string, level: number, description?: string): Promise<Role>;
    updateRole(roleId: number, title: string, description?: string, level?: number): Promise<Role>;
    deleteRole(roleId: number): Promise<void>;
    addUserToRole(roleId: number, username: string): Promise<Role>;
    removeUserFromRole(roleId: number, username: string): Promise<Role>;
}