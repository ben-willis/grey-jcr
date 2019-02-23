import RoleService from '../RoleService';
import Role from '../entities/Role';

const mockRoles: Role[] = [
    {id: 1, title: "President", slug: "president", description: "", level: 4, roleUsers: []},
    {id: 2, title: "FACSO", slug: "facso", description: "", level: 4, roleUsers: []},
    {id: 3, title: "Secretary", slug: "secretary", description: "", level: 3, roleUsers: []},
    {id: 4, title: "Welfare Officer", slug: "welfare-officer", description: "", level: 2, roleUsers: []},
    {id: 5, title: "International Representative", slug: "international-rep", description: "", level: 1, roleUsers: []},
];

export default class MockRoleService implements RoleService {
    async getRoles(level?: number): Promise<Role[]> {
        if (level) {
            return mockRoles.filter(r => r.level === level);
        } else {
            return mockRoles;
        }
    }

    async getRolesForUser(username: string): Promise<Role[]> {
        return [];
    }

    async getRoleById(roleId: number): Promise<Role> {
        return mockRoles.find(r => r.id === roleId);
    }

    getRoleBySlug(slug: string): Promise<Role> {
        throw new Error("Method not implemented.");
    }

    createRole(title: string, description: string, level: number): Promise<Role> {
        throw new Error("Method not implemented.");
    }

    updateRole(roleId: number, title: string, description: string, level: number): Promise<Role> {
        throw new Error("Method not implemented.");
    }

    deleteRole(roleId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    addUserToRole(roleId: number, username: string): Promise<Role> {
        throw new Error("Method not implemented.");
    }

    removeUserFromRole(roleId: number, username: string): Promise<Role> {
        throw new Error("Method not implemented.");
    }
}