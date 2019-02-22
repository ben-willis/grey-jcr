import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import Role from "./Role";

@Entity({
    name: "user_roles",
})
export default class RoleUser {
    @PrimaryColumn({type: "varchar", length: 6})
    public username: string;

    @PrimaryColumn({type: "integer", name: "role_id"})
    public roleId: number;

    @ManyToOne((type) => Role, (role) => role.roleUsers, {onDelete: "CASCADE"})
    @JoinColumn({name: "role_id"})
    public role: Promise<Role>;
}
