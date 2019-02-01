import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinTable} from "typeorm";

@Entity({
    name: "blogs",
})
export default class Article {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "character varying", length: 255})
    public title: string;

    @Column({type: "character varying", length: 255})
    public slug: string;

    @Column({type: "text", name: "message", nullable: true})
    public content: string;

    @UpdateDateColumn({type: "timestamp with time zone", nullable: true})
    public updated: Date;

    @Column({type: "integer", name: "role_id", nullable: true})
    public roleId: number;

    public role: any;

    @Column({type: "varchar", length: 6, name: "author", nullable: true})
    public authorUsername: string;

    public author: any;
}