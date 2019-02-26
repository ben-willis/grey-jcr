
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Position from "./Position";
import Vote from "./Vote";

@Entity("election_position_nominees")
export default class Nominee {
    @PrimaryGeneratedColumn({ type: "integer" })
    public id: number;

    @Column({ type: "text" })
    public name: string;

    @Column({ type: "text", nullable: true })
    public manifesto?: string;

    @ManyToOne((type) => Position, (position) => position.nominees, {onDelete: "CASCADE"})
    @JoinColumn({ name: "position_id" })
    public position?: Position;

    @OneToMany((type) => Vote, (vote) => vote.nominee)
    public votes?: Vote[];
}