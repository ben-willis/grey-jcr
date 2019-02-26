import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Election from "./Election";
import Nominee from "./Nominee";
import Position from "./Position";

@Entity("election_votes")
export default class Vote {
    @PrimaryGeneratedColumn({ type: "integer" })
    public id: number;

    @ManyToOne((type) => Nominee, (nominee) => nominee.votes, {onDelete: "CASCADE"})
    @JoinColumn({ name: "nominee_id" })
    public nominee?: Nominee;

    @ManyToOne((type) => Position, (position) => position.votes, {onDelete: "CASCADE"})
    @JoinColumn({ name: "position_id" })
    public position?: Position;

    @ManyToOne((type) => Election, (election) => election.votes, {onDelete: "CASCADE"})
    @JoinColumn({ name: "election_id" })
    public election?: Election;

    @Column({ type: "varchar", length: 255 })
    public preference: number;

    @Column({ type: "varchar", length: 255 })
    public usercode: number;

    @Column({ type: "varchar", length: 6, nullable: true })
    public username: string;
}