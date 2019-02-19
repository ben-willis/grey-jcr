import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Folder from "./Folder";

@Entity({
    name: "files",
})
export default class Debt extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "text"})
    public name: string;

    @Column({nullable: true, type: "text"})
    public description?: string;

    @Column({type: "text"})
    public path: string;

    @ManyToOne(type => Folder, (folder) => folder.files)
    @JoinColumn({name: "folder_id"})
    public parent: Promise<Folder>;

    @Column({name: "updated", type: "timestamp with time zone", default: () => "now()"})
    public updated: Date;
}