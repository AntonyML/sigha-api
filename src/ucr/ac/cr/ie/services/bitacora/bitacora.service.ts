import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  BitacoraEntrada,
  BitacoraAcuse,
  BitacoraCategoria,
  BitacoraVisibilidad,
  BitacoraUrgencia,
  BitacoraEstado,
} from '../../domain/bitacora';
import {
  CrearBitacoraEntradaDto,
  ActualizarEstadoBitacoraDto,
  RegistrarAcuseBitacoraDto,
} from '../../dto/bitacora';
import { Perfil } from '../../domain/core/perfil.entity';
import { User } from '../../domain/auth/core/user.entity';

@Injectable()
export class BitacoraService {
  private readonly logger = new Logger(BitacoraService.name);

  constructor(
    @Inject('BitacoraEntradaRepository')
    private readonly entradaRepository: Repository<BitacoraEntrada>,
    @Inject('BitacoraAcuseRepository')
    private readonly acuseRepository: Repository<BitacoraAcuse>,
    @Inject('PerfilRepository')
    private readonly perfilRepository: Repository<Perfil>,
    @Inject('UserRepository')
    private readonly userRepository: Repository<User>,
  ) {}

  async crearEntrada(
    dto: CrearBitacoraEntradaDto,
    autorId: number,
    tenantId: number,
  ): Promise<BitacoraEntrada> {
    const autor = await this.userRepository.findOne({ where: { id: autorId } });
    if (!autor) {
      throw new NotFoundException(`Usuario autor con ID ${autorId} no encontrado`);
    }

    let perfilId = dto.perfilId;
    if (!perfilId && dto.olderAdultId) {
      // Compatibility lookup for olderAdultId
      const p = await this.perfilRepository.findOne({
        where: { id: String(dto.olderAdultId) as any },
      });
      if (p) perfilId = p.id;
    }

    if (perfilId) {
      const perfil = await this.perfilRepository.findOne({ where: { id: perfilId } });
      if (!perfil) {
        throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
      }
    }

    const entrada = this.entradaRepository.create({
      tenantId: tenantId || 1,
      perfilId: perfilId ?? null,
      autorId,
      padreId: dto.padreId ?? null,
      titulo: dto.titulo ?? '',
      contenido: dto.contenido,
      categoria: dto.categoria ?? BitacoraCategoria.GENERAL,
      visibilidad: dto.visibilidad ?? BitacoraVisibilidad.GENERAL,
      urgencia: dto.urgencia ?? BitacoraUrgencia.BAJA,
      estado: dto.estado ?? BitacoraEstado.PUBLICADO,
      requiereAcuse: dto.requiereAcuse ?? false,
      adjuntos: dto.adjuntos ?? [],
    });

    const guardada = await this.entradaRepository.save(entrada);
    this.logger.log(`Entrada de bitácora creada con ID: ${guardada.id}`);
    return guardada;
  }

  async obtenerPorPerfil(
    perfilId: string,
    usuarioId?: number,
    rol?: string,
  ): Promise<BitacoraEntrada[]> {
    const query = this.entradaRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.autor', 'autor')
      .leftJoinAndSelect('e.acuses', 'acuses')
      .leftJoinAndSelect('e.respuestas', 'respuestas')
      .where('e.perfil_id = :perfilId', { perfilId })
      .andWhere('e.deleted_at IS NULL')
      .andWhere('e.padre_id IS NULL')
      .orderBy('e.creado_en', 'DESC');

    // Filter by visibility based on user role
    const rolNormalizado = (rol || '').toLowerCase();
    const esClinico = ['nurse', 'physiotherapist', 'psychologist', 'social worker'].includes(rolNormalizado);
    const esAdmin = ['super admin', 'admin', 'director'].includes(rolNormalizado);

    if (!esAdmin) {
      if (esClinico) {
        query.andWhere('e.visibilidad IN (:...vis)', {
          vis: [BitacoraVisibilidad.GENERAL, BitacoraVisibilidad.CLINICA],
        });
      } else {
        query.andWhere('e.visibilidad = :vis', {
          vis: BitacoraVisibilidad.GENERAL,
        });
      }
    }

    return query.getMany();
  }

  async obtenerTodas(
    tenantId: number,
    options?: {
      categoria?: string;
      visibilidad?: string;
      urgencia?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ total: number; data: BitacoraEntrada[] }> {
    const query = this.entradaRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.autor', 'autor')
      .leftJoinAndSelect('e.perfil', 'perfil')
      .where('e.tenant_id = :tenantId', { tenantId })
      .andWhere('e.deleted_at IS NULL')
      .andWhere('e.padre_id IS NULL');

    if (options?.categoria) {
      query.andWhere('e.categoria = :categoria', { categoria: options.categoria });
    }
    if (options?.visibilidad) {
      query.andWhere('e.visibilidad = :visibilidad', { visibilidad: options.visibilidad });
    }
    if (options?.urgencia) {
      query.andWhere('e.urgencia = :urgencia', { urgencia: options.urgencia });
    }

    query.orderBy('e.creado_en', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }
    if (options?.offset) {
      query.skip(options.offset);
    }

    const [data, total] = await query.getManyAndCount();
    return { total, data };
  }

  async obtenerPorId(id: number): Promise<BitacoraEntrada> {
    const entrada = await this.entradaRepository.findOne({
      where: { id },
      relations: ['autor', 'perfil', 'acuses', 'respuestas', 'respuestas.autor'],
    });
    if (!entrada) {
      throw new NotFoundException(`Entrada de bitácora #${id} no encontrada`);
    }
    return entrada;
  }

  async actualizarEstado(
    id: number,
    dto: ActualizarEstadoBitacoraDto,
    usuarioId: number,
  ): Promise<BitacoraEntrada> {
    const entrada = await this.obtenerPorId(id);
    entrada.estado = dto.estado;
    await this.entradaRepository.save(entrada);
    this.logger.log(`Entrada #${id} actualizada a estado ${dto.estado} por usuario ${usuarioId}`);
    return entrada;
  }

  async registrarAcuse(
    entradaId: number,
    usuarioId: number,
    dto?: RegistrarAcuseBitacoraDto,
  ): Promise<BitacoraAcuse> {
    const entrada = await this.obtenerPorId(entradaId);

    const existente = await this.acuseRepository.findOne({
      where: { entradaId, usuarioId },
    });
    if (existente) {
      return existente;
    }

    const acuse = this.acuseRepository.create({
      tenantId: entrada.tenantId,
      entradaId,
      usuarioId,
      comentario: dto?.comentario ?? '',
    });

    return this.acuseRepository.save(acuse);
  }

  // --- COMPATIBILITY SHIMS FOR LEGACY MemosService CALLERS ---
  async createMemo(dto: any, authorId: number): Promise<any> {
    return this.crearEntrada(dto, authorId, 1);
  }

  async getByOlderAdult(olderAdultId: any, userId?: any, role?: any): Promise<any> {
    return this.obtenerPorPerfil(String(olderAdultId), userId, role);
  }

  async findOneById(id: number): Promise<any> {
    return this.obtenerPorId(id);
  }

  async updateStatus(id: number, dto: any, userId: number): Promise<any> {
    return this.actualizarEstado(id, dto, userId);
  }

  async acknowledgeMemo(id: number, userId: number, dto?: any): Promise<any> {
    return this.registrarAcuse(id, userId, dto);
  }
}
