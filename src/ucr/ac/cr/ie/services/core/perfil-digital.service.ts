import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  PerfilDigital,
  Perfil,
  PlantillaPerfil,
  SeccionCampo,
  DefinicionCampo,
} from '../../domain/core';
import {
  GuardarPerfilDigitalDto,
  CrearSeccionCampoDto,
  CrearDefinicionCampoDto,
} from '../../dto/perfil-digital';

@Injectable()
export class PerfilDigitalService {
  private readonly logger = new Logger(PerfilDigitalService.name);

  constructor(
    @Inject('PerfilDigitalRepository')
    private readonly perfilDigitalRepo: Repository<PerfilDigital>,
    @Inject('PerfilRepository')
    private readonly perfilRepo: Repository<Perfil>,
    @Inject('PlantillaPerfilRepository')
    private readonly plantillaRepo: Repository<PlantillaPerfil>,
    @Inject('SeccionCampoRepository')
    private readonly seccionRepo: Repository<SeccionCampo>,
    @Inject('DefinicionCampoRepository')
    private readonly campoRepo: Repository<DefinicionCampo>,
    @Inject('DataSource')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene el perfil digital de una persona/residente junto con su esquema dinámico de campos
   */
  async obtenerPorPerfilId(perfilId: string, tenantId: number): Promise<{
    perfilDigital: PerfilDigital | null;
    esquema: PlantillaPerfil | null;
  }> {
    const perfil = await this.perfilRepo.findOne({
      where: { id: perfilId, tenantId },
      relations: ['personaRol'],
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    // Cargar perfil digital
    const perfilDigital = await this.perfilDigitalRepo.findOne({
      where: { perfilId, tenantId },
      relations: ['plantilla'],
    });

    // Cargar plantilla con sus secciones y campos ordenados
    const rolAplicable = perfil.personaRol?.rol || 'RESIDENTE';
    const plantillaId = perfilDigital?.plantillaId;

    const qb = this.plantillaRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.secciones', 's')
      .leftJoinAndSelect('s.campos', 'c', 'c.deleted_at IS NULL')
      .where('p.tenant_id = :tenantId', { tenantId })
      .orderBy('s.orden', 'ASC')
      .addOrderBy('c.orden', 'ASC');

    if (plantillaId) {
      qb.andWhere('p.id = :plantillaId', { plantillaId });
    } else {
      qb.andWhere('p.rol_aplicable = :rolAplicable AND p.es_vigente = true', {
        rolAplicable,
      });
    }

    const esquema = await qb.getOne();

    return {
      perfilDigital: perfilDigital || null,
      esquema: esquema || null,
    };
  }

  /**
   * Guarda o actualiza los datos dinámicos (JSONB) del perfil digital
   */
  async guardarDatos(
    perfilId: string,
    dto: GuardarPerfilDigitalDto,
    tenantId: number,
  ): Promise<PerfilDigital> {
    const perfil = await this.perfilRepo.findOne({
      where: { id: perfilId, tenantId },
      relations: ['personaRol'],
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    let perfilDigital = await this.perfilDigitalRepo.findOne({
      where: { perfilId, tenantId },
    });

    if (perfilDigital) {
      // Merge datos JSONB
      const nuevosDatos = {
        ...perfilDigital.datos,
        ...dto.datos,
      };

      await this.dataSource.query(
        `UPDATE core.perfil_digital 
         SET datos = $1::jsonb,
             metadata = metadata || $2::jsonb,
             plantilla_id = COALESCE($3, plantilla_id),
             updated_at = CURRENT_TIMESTAMP
         WHERE perfil_id = $4 AND tenant_id = $5`,
        [
          JSON.stringify(nuevosDatos),
          JSON.stringify(dto.metadata || {}),
          dto.plantillaId || null,
          perfilId,
          tenantId,
        ],
      );
    } else {
      // Determinar plantilla
      let plantillaId = dto.plantillaId;
      if (!plantillaId) {
        const rolAplicable = perfil.personaRol?.rol || 'RESIDENTE';
        const plantilla = await this.plantillaRepo.findOne({
          where: { tenantId, rolAplicable, esVigente: true },
        });
        plantillaId = plantilla?.id || '018f0000-0000-7000-8000-000000000001';
      }

      await this.dataSource.query(
        `INSERT INTO core.perfil_digital (tenant_id, perfil_id, plantilla_id, datos, metadata)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)`,
        [
          tenantId,
          perfilId,
          plantillaId,
          JSON.stringify(dto.datos || {}),
          JSON.stringify(dto.metadata || {}),
        ],
      );
    }

    const actualizado = await this.perfilDigitalRepo.findOne({
      where: { perfilId, tenantId },
      relations: ['plantilla'],
    });

    this.logger.log(`Perfil digital actualizado para perfil ${perfilId}`);
    return actualizado!;
  }

  /**
   * Obtiene la plantilla vigente de campos para un rol específico
   */
  async obtenerPlantillaVigente(
    rol: string,
    tenantId: number,
  ): Promise<PlantillaPerfil> {
    const plantilla = await this.plantillaRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.secciones', 's')
      .leftJoinAndSelect('s.campos', 'c', 'c.deleted_at IS NULL')
      .where('p.tenant_id = :tenantId', { tenantId })
      .andWhere('p.rol_aplicable = :rol', { rol: rol.toUpperCase() })
      .andWhere('p.es_vigente = true')
      .orderBy('s.orden', 'ASC')
      .addOrderBy('c.orden', 'ASC')
      .getOne();

    if (!plantilla) {
      throw new NotFoundException(
        `No se encontró una plantilla de perfil activa para el rol ${rol}`,
      );
    }

    return plantilla;
  }

  /**
   * Crea una nueva sección en una plantilla
   */
  async crearSeccion(
    dto: CrearSeccionCampoDto,
    tenantId: number,
  ): Promise<SeccionCampo> {
    const plantilla = await this.plantillaRepo.findOne({
      where: { id: dto.plantillaId, tenantId },
    });
    if (!plantilla) {
      throw new NotFoundException(`Plantilla con ID ${dto.plantillaId} no encontrada`);
    }

    const res = await this.dataSource.query(
      `INSERT INTO core.seccion_campo (tenant_id, plantilla_id, clave, titulo, descripcion, icono, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, clave, titulo, orden`,
      [
        tenantId,
        dto.plantillaId,
        dto.clave,
        dto.titulo,
        dto.descripcion || '',
        dto.icono || null,
        dto.orden ?? 0,
      ],
    );

    return this.seccionRepo.findOne({ where: { id: res[0].id } }) as Promise<SeccionCampo>;
  }

  /**
   * Crea una nueva definición de campo en una sección
   */
  async crearDefinicionCampo(
    dto: CrearDefinicionCampoDto,
    tenantId: number,
  ): Promise<DefinicionCampo> {
    const seccion = await this.seccionRepo.findOne({
      where: { id: dto.seccionId },
    });
    if (!seccion) {
      throw new NotFoundException(`Sección con ID ${dto.seccionId} no encontrada`);
    }

    const res = await this.dataSource.query(
      `INSERT INTO core.definicion_campo (
         tenant_id, seccion_id, clave, etiqueta, descripcion, tipo,
         opciones, validacion, valor_defecto, obligatorio, visible, orden
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, $12)
       RETURNING id, clave, etiqueta, tipo`,
      [
        tenantId,
        dto.seccionId,
        dto.clave,
        dto.etiqueta,
        dto.descripcion || '',
        dto.tipo,
        JSON.stringify(dto.opciones || []),
        JSON.stringify(dto.validacion || {}),
        dto.valorDefecto !== undefined ? JSON.stringify(dto.valorDefecto) : null,
        dto.obligatorio ?? false,
        dto.visible ?? true,
        dto.orden ?? 0,
      ],
    );

    return this.campoRepo.findOne({ where: { id: res[0].id } }) as Promise<DefinicionCampo>;
  }

  /**
   * Actualiza la definición de un campo configurable
   */
  async actualizarDefinicionCampo(
    campoId: string,
    dto: Partial<CrearDefinicionCampoDto>,
    tenantId: number,
  ): Promise<DefinicionCampo> {
    const campo = await this.campoRepo.findOne({
      where: { id: campoId, tenantId },
    });
    if (!campo) {
      throw new NotFoundException(`Campo con ID ${campoId} no encontrado`);
    }

    if (dto.etiqueta) campo.etiqueta = dto.etiqueta;
    if (dto.descripcion !== undefined) campo.descripcion = dto.descripcion;
    if (dto.opciones) campo.opciones = dto.opciones;
    if (dto.validacion) campo.validacion = dto.validacion;
    if (dto.valorDefecto !== undefined) campo.valorDefecto = dto.valorDefecto;
    if (dto.obligatorio !== undefined) campo.obligatorio = dto.obligatorio;
    if (dto.visible !== undefined) campo.visible = dto.visible;
    if (dto.orden !== undefined) campo.orden = dto.orden;

    return this.campoRepo.save(campo);
  }

  /**
   * Eliminación lógica (soft-delete) de un campo dinámico
   */
  async eliminarDefinicionCampo(campoId: string, tenantId: number): Promise<void> {
    const campo = await this.campoRepo.findOne({
      where: { id: campoId, tenantId },
    });
    if (!campo) {
      throw new NotFoundException(`Campo con ID ${campoId} no encontrado`);
    }

    campo.deletedAt = new Date();
    await this.campoRepo.save(campo);
  }
}
