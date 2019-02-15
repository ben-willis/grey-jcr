import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "debts",
})
export default class Debt extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "character varying", length: 255})
    public name: string;

    @Column({nullable: true, type: "text"})
    public message?: string;

    @Column({nullable: true, type: "text"})
    public link?: string;

    @Column({default: 0})
    public amount: number;

    @Column({name: "debt_added", type: "timestamp with time zone", default: () => "now()"})
    public added: Date;

    @Column({type: "character varying", length: 6})
    public username: string;
}