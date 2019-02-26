import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Election from "./Election";
import Nominee from "./Nominee";
import Vote from "./Vote";

@Entity("election_positions")
export default class Position {
    @PrimaryGeneratedColumn({ type: "integer" })
    public id: number;

    @Column({ type: "text" })
    public name: string;

    @ManyToOne((type) => Election, (election) => election.positions)
    @JoinColumn({ name: "election_id" })
    public election?: Election;

    @OneToMany((type) => Nominee, (nominee) => nominee.position, {eager: true, onDelete: "CASCADE"})
    public nominees: Nominee[];

    @OneToMany((type) => Vote, (vote) => vote.position)
    public votes?: Vote[];
}