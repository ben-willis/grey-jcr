import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieSerializer extends PassportSerializer {
    serializeUser(user: any, done: (err: any, id?: any) => void): void {
        done(null, user.username);
    }

    deserializeUser(username: string, done: (err: any, id?: any) => void): void {
        done(null, { username, name: "ben", level: 1 });
    }
}