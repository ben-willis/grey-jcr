
import Nominee from "../entities/Nominee";
import Position from "../entities/Position";
import ElectionRound from "./ElectionRound";

export default interface PositionResults {
    position: Position;
    winner: Nominee;
    breakDown: ElectionRound[];
}