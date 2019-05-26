import { GetSocietiesRequest, SocietyType, UpdateSocietyRequest } from "./models";
import Society from "./entities/Society";

export default interface SocietiesService {
    getSocieties(getSocietiesRequest: GetSocietiesRequest): Promise<Society[]>;
    getSociety(type: SocietyType, slug: string): Promise<Society>;
    getSociety(id: number): Promise<Society>;
    createSociety(createSocietyRequest: Society): Promise<Society>;
    updateSociety(UpdateSocietyRequest: UpdateSocietyRequest): Promise<Society>;
    deleteSociety(id: number): Promise<void>;
}
