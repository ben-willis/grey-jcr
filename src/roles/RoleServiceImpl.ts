import slugify from 'slugify';
import { Repository, FindManyOptions, In } from 'typeorm';

import RoleService from "./RoleService";
import Role from "./entities/Role";
import RoleUser from './entities/RoleUser';

export default class RoleServiceImpl implements RoleService {
    constructor(
        private roleRepo: Repository<Role>,
        private roleUserRepo: Repository<RoleUser>
    ){};

    getRoles(level?: number): Promise<Role[]> {
        const findOptions: FindManyOptions<Role> = level ? {where: {level}} : {};

        return this.roleRepo.find(findOptions);
    }

    async getRolesForUser(username: string): Promise<Role[]> {
        const roleUsers = await this.roleUserRepo.find({where: {username}});
        const roleIds = roleUsers.map(roleUser => roleUser.roleId);

        if (roleIds.length === 0) {
            return [];
        } else {
            return this.roleRepo.find({where: {id: In(roleIds)}});
        }
    }

    getRoleById(roleId: number): Promise<Role> {
        return this.roleRepo.findOneOrFail(roleId);
    }

    getRoleBySlug(slug: string): Promise<Role> {
        return this.roleRepo.findOne({where: {slug}});
    }

    createRole(title: string, description: string, level: number): Promise<Role> {
        const role = this.roleRepo.create({title, level, description, slug: slugify(title, {lower: true})});

        return this.roleRepo.save(role);
    }

    async updateRole(roleId: number, title: string, description: string, level: number): Promise<Role> {
        const role = await this.roleRepo.findOneOrFail(roleId);
        role.title = title;
        role.description = description;
        role.level = level;
        role.slug = slugify(title, {lower: true});
        delete role.roleUsers;

        return this.roleRepo.save(role);
    }

    deleteRole(roleId: number): Promise<void> {
        return this.roleRepo.delete(roleId).then(() => null);
    }

    addUserToRole(roleId: number, username: string): Promise<Role> {
        if (username.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) {
            const roleUser = this.roleUserRepo.create({roleId, username});
            return this.roleUserRepo.save(roleUser).then(() => this.roleRepo.findOne(roleId));
        } else {
            return Promise.reject(new Error("Invalid username entered: \"" + username + "\""));
        }
    }

    removeUserFromRole(roleId: number, username: string): Promise<Role> {
        this.roleUserRepo.delete({roleId, username});

        return this.roleRepo.findOneOrFail(roleId);
    }
}
