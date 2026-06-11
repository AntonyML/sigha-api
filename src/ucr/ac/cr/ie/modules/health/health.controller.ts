import { Controller, Get, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        @Inject('DataSource')
        private readonly dataSource: DataSource,
    ) {}

    @Public()
    @Get()
    check(): string {
        return 'ok';
    }

    @Public()
    @Get('db')
    async checkDb(): Promise<string> {
        await this.dataSource.query('SELECT 1');
        return 'db ok';
    }
}
