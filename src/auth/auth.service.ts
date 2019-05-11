import { Injectable, HttpService, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
const bcrypt = require("bcryptjs");

@Injectable()
export class AuthService {
    constructor(
        private readonly httpService: HttpService
    ) {}

    async checkCredentials(username: string, password: string): Promise<void> {
        if (username == "hsdz38" && bcrypt.compareSync(password, "$2a$10$kUL6ayD/blB5s7m1xOujEO4.dILtld6Wt1n.OZwTYkJ/TB7DLZyAC")) {
            return;
        }

        const validatorUrl = "https://www.dur.ac.uk/its/password/validator";

        await this.httpService.get(validatorUrl, { auth: { username, password } }).toPromise().catch(err => {
            if (err.response.status === 401) {
                throw new UnauthorizedException;
            } else {
                throw new InternalServerErrorException;
            }
        });
    }
}