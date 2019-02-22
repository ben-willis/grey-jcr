import { Repository } from 'typeorm';
import Role from "../entities/Role";
import RoleUser from '../entities/RoleUser';

export default class RoleFixtures {
    public roles: Role[];

    constructor(
        private roleRepo: Repository<Role>,
        private roleUserRepo: Repository<RoleUser>
    ) {
        this.roles = [];
    };

    public async load(): Promise<void> {
        this.roles = await this.roleRepo.save([
            {title: "President", slug: "president", description: "", level: 4, roleUsers: []},
            {title: "FACSO", slug: "facso", description: "", level: 4, roleUsers: []},
            {title: "Secretary", slug: "secretary", description: "", level: 3, roleUsers: []},
            {title: "Welfare Officer", slug: "welfare-officer", description: "", level: 2, roleUsers: []},
            {title: "International Representative", slug: "international-rep", description: "", level: 1, roleUsers: []},
        ]);

        let roleUser = new RoleUser();
        roleUser.username = "aaaa11";
        roleUser.roleId = this.roles[0].id;
        roleUser.role = Promise.resolve(this.roles[0]);
        
        roleUser = await this.roleUserRepo.save(roleUser);

        this.roles[0].roleUsers = [roleUser];
    }

    public async clear(): Promise<void> {
        await this.roleRepo.delete({});
        this.roles = [];
    }
}