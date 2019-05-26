import Society from "../entities/Society";
import { IsEnum } from "class-validator";

export enum SocietyType {
    Society = 0,
    Sport = 1,
}

export class GetSocietiesRequest {

    @IsEnum(SocietyType)
    public type?: SocietyType;

    public query?: string;

}

export class UpdateSocietyRequest {
    public id: number;
    public society?: Partial<Society>
}
