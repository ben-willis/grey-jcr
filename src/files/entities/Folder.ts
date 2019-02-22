import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import File from "./File";

@Entity({
    name: "folders",
})
export default class Folder extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "text"})
    public name: string;

    @ManyToOne(type => Folder, (folder) => folder.subfolders, {nullable: true, onDelete: "CASCADE"})
    @JoinColumn({name: "parent_id"})
    public parent?: Promise<Folder>;

    @OneToMany(type => Folder, (folder) => folder.parent)
    public subfolders: Folder[];

    @OneToMany(type => File, (file) => file.parent, {eager: true})
    public files: File[];

    @Column({type: "integer", nullable: true})
    public owner?: number;
}