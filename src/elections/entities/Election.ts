import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import Position from "./Position";
import Vote from "./Vote";
import ElectionStatus from "../models/ElectionStatus";

@Entity("elections")
export default class Election {
    @PrimaryGeneratedColumn({ type: "integer" })
    public id: number;

    @Column({ type: "text" })
    public name: string;

    @Column({ type: "integer", default: ElectionStatus.closed })
    public status: ElectionStatus;

    @OneToMany((type) => Position, (position) => position.election, {eager: true})
    public positions: Position[];

    @OneToMany((type) => Vote, (vote) => vote.election)
    public votes?: Vote[];
}