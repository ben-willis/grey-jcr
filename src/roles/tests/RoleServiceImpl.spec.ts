import { expect } from 'chai';
import { Repository, Connection, createConnection } from 'typeorm';
import RoleFixtures from "./RoleFixtures";
import RoleUser from '../entities/RoleUser';
import Role from '../entities/Role';
import { RoleService } from '../RoleService';
import RoleServiceImpl from '../RoleServiceImpl';

describe("Role Service", () => {
    let connection: Connection;
    let roleRepo: Repository<Role>;
    let roleUserRepo: Repository<RoleUser>;
    let roleFixtures: RoleFixtures;
    let roleService: RoleService;

    before(async () => {
        connection = await createConnection("grey");
        roleRepo = connection.getRepository(Role);
        roleUserRepo = connection.getRepository(RoleUser);
        roleFixtures = new RoleFixtures(roleRepo, roleUserRepo);
        roleService = new RoleServiceImpl(roleRepo, roleUserRepo);
    });

    beforeEach(() => roleFixtures.load());

    afterEach(() => roleFixtures.clear());

    after(() => connection.close());

    it("should get all roles", () => {
        return roleService.getRoles().then((roles) => {
            expect(roles).to.have.length(roleFixtures.roles.length);
            expect(roles[0]).to.have.property("roleUsers");
        });
    });

    it("should get roles by level", () => {
        const expectedRoles = roleFixtures.roles.filter((role) => role.level === 4);
        return roleService.getRoles(4).then((roles) => {
            expect(roles).to.have.length(expectedRoles.length);
            expect(roles.map(r => r.title)).to.contain(expectedRoles[0].title);
        })
    });

    it("should get a role by id", () => {
        const expectedRole = roleFixtures.roles[0];
        return roleService.getRoleById(expectedRole.id).then((role) => {
            expect(role.title).to.equal(expectedRole.title);
        });
    });

    it("should get a role by slug", () => {
        const expectedRole = roleFixtures.roles[0];
        return roleService.getRoleBySlug(expectedRole.slug).then((role) => {
            expect(role.title).to.equal(expectedRole.title);
        });
    });

    it("should get roles for a user", () => {
        const expectedRoles = roleFixtures.roles.filter(r => r.roleUsers.findIndex(ru => ru.username === "aaaa11") > -1);
        return roleService.getRolesForUser("aaaa11").then((roles) => {
            expect(roles).to.have.length(expectedRoles.length);
            expect(roles.map(r => r.id)).to.contain(expectedRoles[0].id);
        })
    });

    it("should update a role", () => {
        const roleId = roleFixtures.roles[0].id;
        return roleService.updateRole(roleId, "Vice President", "Now the VP", 4).then((role) => {
            expect(role.title).to.equal("Vice President");
        });
    });

    it("should delete a role", () => {
        const roleId = roleFixtures.roles[0].id;
        return roleService.deleteRole(roleId).then(() => {
            return roleRepo.findOne(roleId);
        }).then((role) => {
            expect(role).to.be.undefined;
        });
    });

    it("should add a user to a role", () => {
        const roleToAddTo = roleFixtures.roles[0];
        return roleService.addUserToRole(roleToAddTo.id, "xdfg41").then((role) => {
            expect(role.roleUsers.map(ru => ru.username)).to.contain("xdfg41");
        });
    });

    it("should remove a user from a role", () => {
        const roleToRemoveFrom = roleFixtures.roles[0];
        const userToRemove = roleFixtures.roles[0].roleUsers[0].username;
        return roleService.removeUserFromRole(roleToRemoveFrom.id, userToRemove).then((role) => {
            expect(role.roleUsers.map(ru => ru.username)).to.not.contain(userToRemove);
        });
    });
})