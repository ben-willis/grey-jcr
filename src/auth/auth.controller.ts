import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from './local.guard';
import { User } from './user.decorator';
import { RequireLevel } from './require-level.decorator';

@Controller("auth")
export class AuthController {
    constructor() {}

    @Post("login")
    @UseGuards(LocalAuthGuard)
    async createToken(@User() user: any): Promise<void> {
        return user;
    }

    @Get("user")
    @RequireLevel(0)
    async getUser(@User() user: any): Promise<any> {
        return user;
    }
}