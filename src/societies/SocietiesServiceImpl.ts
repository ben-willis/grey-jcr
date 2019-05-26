import { GetSocietiesRequest } from './models/index';
import SocietiesService from "./SocietiesService";
import Society from './entities/Society';
import { Repository, Like } from 'typeorm';

export default class SocietiesServiceImpl implements SocietiesService {
    constructor(private readonly societiesRepo: Repository<Society>) {}

    async getSocieties(getSocietiesRequest: GetSocietiesRequest): Promise<Society[]> {
        return this.societiesRepo.find({
            where: {
                type: getSocietiesRequest.type,
                name: getSocietiesRequest.query && Like(`%${getSocietiesRequest.query}%`)
            }
        });
    }
}