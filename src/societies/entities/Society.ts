import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { SocietyType } from "../models";

@Entity({
    name: "societies"
})
@Unique(["type", "slug"])
export default class Society {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "integer"})
    public type: SocietyType;

    @Column({ type: "character varying", length: 255 })
    public name: string;

    @Column({ nullable: true, type: "text" })
    public description?: string;

    @Column({ nullable: true, type: "text" })
    public facebook?: string;

    @Column({ nullable: true, type: "text" })
    public twitter?: string;

    @Column({ nullable: true, type: "text" })
    public email?: string;

    @Column({ type: "character varying", length: 255 })
    public slug: string;
}