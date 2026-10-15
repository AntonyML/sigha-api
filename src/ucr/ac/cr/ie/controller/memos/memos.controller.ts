import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MemosService } from '../../services/memos/memos.service';
import { CreateMemoDto, UpdateMemoStatusDto } from '../../dto/memos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Resident Memos (Bitácora y Derivaciones Interdepartamentales)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memos')
export class MemosController {
    constructor(private readonly memosService: MemosService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una nota en la bitácora o una derivación interdepartamental' })
    @ApiResponse({ status: 201, description: 'Nota creada y notificación programada si aplica' })
    async createMemo(@Body() dto: CreateMemoDto, @Req() req: any) {
        const userId = req.user?.userId || req.user?.id || 1;
        return this.memosService.createMemo(dto, userId);
    }

    @Get('older-adult/:id')
    @ApiOperation({ summary: 'Obtener todas las notas y derivaciones de un adulto mayor' })
    @ApiResponse({ status: 200, description: 'Lista de notas del residente con filtros de visibilidad aplicados' })
    async getByOlderAdult(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role || req.user?.roleName;
        return this.memosService.getByOlderAdult(id, userId, role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar un memo específico por ID' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.memosService.findOneById(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Actualizar el estado de una nota o derivación (Abierto, En proceso, Resuelto)' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMemoStatusDto,
        @Req() req: any
    ) {
        const userId = req.user?.userId || req.user?.id || 1;
        return this.memosService.updateStatus(id, dto, userId);
    }

    @Post(':id/acknowledge')
    @ApiOperation({ summary: 'Registrar acuse de recibo de una derivación asignada' })
    async acknowledgeMemo(
        @Param('id', ParseIntPipe) id: number,
        @Body('notes') notes: string,
        @Req() req: any
    ) {
        const userId = req.user?.userId || req.user?.id || 1;
        return this.memosService.acknowledgeMemo(id, userId, notes);
    }
}
