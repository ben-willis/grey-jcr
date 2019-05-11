import { Module, HttpModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { CookieSerializer } from './cookie.serializer';
import { APP_GUARD } from '@nestjs/core';
import { UserGuard } from './user.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'local', session: true }),
        HttpModule
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, CookieSerializer, {
        provide: APP_GUARD,
        useClass: UserGuard,
      },],
    exports: [PassportModule]
})
export class AuthModule {}