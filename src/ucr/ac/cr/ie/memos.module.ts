import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { EmailModule } from './email.module';
import { MemosController } from './controller/memos/memos.controller';
import { MemosService } from './services/memos/memos.service';
import { memosProviders } from './repository/memos/memos.providers';
import { virtualRecordsProviders } from './repository/virtual-records';
import { authProviders } from './repository/auth';

@Module({
    imports: [DatabaseModule, EmailModule, ConfigModule],
    controllers: [MemosController],
    providers: [
        MemosService,
        ...memosProviders,
        ...virtualRecordsProviders.filter(
            (provider) => provider.provide === 'OlderAdultRepository'
        ),
        ...authProviders.filter(
            (provider) =>
                provider.provide === 'UserRepository' || provider.provide === 'RoleRepository'
        ),
    ],
    exports: [MemosService],
})
export class MemosModule {}
