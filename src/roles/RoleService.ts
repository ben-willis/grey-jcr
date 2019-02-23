import Role from "./entities/Role";

export default interface RoleService {
    getRoles(level?: number): Promise<Role[]>;
    getRolesForUser(username: string): Promise<Role[]>;
    getRoleById(roleId: number): Promise<Role>;
    getRoleBySlug(slug: string): Promise<Role>;
    createRole(title: string, description: string, level: number): Promise<Role>;
    updateRole(roleId: number, title: string, description: string, level: number): Promise<Role>;
    deleteRole(roleId: number): Promise<void>;
    addUserToRole(roleId: number, username: string): Promise<Role>;
    removeUserFromRole(roleId: number, username: string): Promise<Role>;
}