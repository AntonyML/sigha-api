import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './ucr/ac/cr/ie/database.module';
import { AuthModule } from './ucr/ac/cr/ie/auth.module';
import { UsersModule } from './ucr/ac/cr/ie/users.module';
import { RolesModule } from './ucr/ac/cr/ie/roles.module';
import { JwtAuthGuard } from './ucr/ac/cr/ie/common/guards/jwt-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        RolesModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }