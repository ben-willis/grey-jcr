import {Column, Entity, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import RoleUser from "./RoleUser";

@Entity({
    name: "roles",
})
export default class Role {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "varchar", length: 255})
    public title: string;

    @Column({type: "text"})
    public description: string;

    @Column({type: "integer"})
    public level: number;
    
    @Column({type: "varchar", length: 255})
    public slug: string;

    @OneToMany((type) => RoleUser, (roleUser) => roleUser.role, {eager: true})
    public roleUsers: RoleUser[];

    public users?: any[];
}
