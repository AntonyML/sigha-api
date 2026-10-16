import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { PerfilDigitalService } from './perfil-digital.service';
import { TipoCampoDinamico } from '../../domain/core/definicion-campo.entity';

describe('PerfilDigitalService', () => {
  let service: PerfilDigitalService;
  let mockPerfilDigitalRepo: any;
  let mockPerfilRepo: any;
  let mockPlantillaRepo: any;
  let mockSeccionRepo: any;
  let mockCampoRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockPerfilRepo = {
      findOne: mock(async ({ where }: any) => {
        if (where?.id === '018f0000-0000-7000-8000-000000000020') {
          return {
            id: '018f0000-0000-7000-8000-000000000020',
            tenantId: 1,
            personaRol: { rol: 'RESIDENTE' },
          };
        }
        return null;
      }),
    };

    mockPerfilDigitalRepo = {
      findOne: mock(async ({ where }: any) => {
        if (where?.perfilId === '018f0000-0000-7000-8000-000000000020') {
          return {
            perfilId: '018f0000-0000-7000-8000-000000000020',
            tenantId: 1,
            plantillaId: '018f0000-0000-7000-8000-000000000001',
            datos: { escolaridad: 'Secundaria', pasatiempos: 'Jardinería' },
            metadata: {},
          };
        }
        return null;
      }),
    };

    mockPlantillaRepo = {
      findOne: mock(async () => ({
        id: '018f0000-0000-7000-8000-000000000001',
        nombre: 'Plantilla Residente Estándar',
        esVigente: true,
      })),
      createQueryBuilder: mock(() => ({
        leftJoinAndSelect: mock().mockReturnThis(),
        where: mock().mockReturnThis(),
        andWhere: mock().mockReturnThis(),
        orderBy: mock().mockReturnThis(),
        addOrderBy: mock().mockReturnThis(),
        getOne: mock(async () => ({
          id: '018f0000-0000-7000-8000-000000000001',
          nombre: 'Plantilla Residente Estándar',
          secciones: [
            {
              id: '018f0000-0000-7000-8000-000000000002',
              clave: 'datos_sociales',
              titulo: 'Historia Social',
              campos: [
                {
                  id: '018f0000-0000-7000-8000-000000000003',
                  clave: 'escolaridad',
                  etiqueta: 'Nivel Educativo',
                  tipo: 'texto',
                },
              ],
            },
          ],
        })),
      })),
    };

    mockSeccionRepo = {
      findOne: mock(async ({ where }: any) => ({
        id: where?.id || '018f0000-0000-7000-8000-000000000002',
        titulo: 'Historia Social',
      })),
    };

    mockCampoRepo = {
      findOne: mock(async ({ where }: any) => ({
        id: where?.id || '018f0000-0000-7000-8000-000000000003',
        etiqueta: 'Nivel Educativo',
        tenantId: 1,
      })),
      save: mock((entity: any) => Promise.resolve(entity)),
    };

    mockDataSource = {
      query: mock(async (sql: string, params: any[]) => {
        if (sql.includes('INSERT INTO core.seccion_campo')) {
          return [{ id: '018f0000-0000-7000-8000-000000000099', clave: params[2], titulo: params[3] }];
        }
        if (sql.includes('INSERT INTO core.definicion_campo')) {
          return [{ id: '018f0000-0000-7000-8000-000000000098', clave: params[2], etiqueta: params[3] }];
        }
        return [];
      }),
    };

    service = new PerfilDigitalService(
      mockPerfilDigitalRepo,
      mockPerfilRepo,
      mockPlantillaRepo,
      mockSeccionRepo,
      mockCampoRepo,
      mockDataSource,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('obtiene el perfil digital y su esquema renderizable', async () => {
    const res = await service.obtenerPorPerfilId('018f0000-0000-7000-8000-000000000020', 1);
    expect(res).toBeDefined();
    expect(res.perfilDigital).toBeDefined();
    expect(res.perfilDigital?.datos.escolaridad).toBe('Secundaria');
    expect(res.esquema).toBeDefined();
    expect(res.esquema?.secciones.length).toBe(1);
  });

  it('lanza NotFoundException cuando el perfil no existe', async () => {
    mockPerfilRepo.findOne = mock(async () => null);
    expect(service.obtenerPorPerfilId('uuid-no-existe', 1)).rejects.toThrow(NotFoundException);
  });

  it('guarda datos dinamicos en el perfil digital', async () => {
    const res = await service.guardarDatos(
      '018f0000-0000-7000-8000-000000000020',
      {
        datos: { pasatiempos: 'Pintura al óleo', idioma_materno: 'Español' },
      },
      1,
    );
    expect(res).toBeDefined();
    expect(mockDataSource.query).toHaveBeenCalled();
  });

  it('crea una nueva seccion en una plantilla', async () => {
    const seccion = await service.crearSeccion(
      {
        plantillaId: '018f0000-0000-7000-8000-000000000001',
        clave: 'habitos_sueno',
        titulo: 'Hábitos de Sueño y Descanso',
      },
      1,
    );
    expect(seccion).toBeDefined();
    expect(mockDataSource.query).toHaveBeenCalled();
  });

  it('crea una nueva definicion de campo dinamico', async () => {
    const campo = await service.crearDefinicionCampo(
      {
        seccionId: '018f0000-0000-7000-8000-000000000002',
        clave: 'horas_sueno_promedio',
        etiqueta: 'Horas de Sueño Promedio',
        tipo: TipoCampoDinamico.NUMERO,
        obligatorio: false,
      },
      1,
    );
    expect(campo).toBeDefined();
    expect(mockDataSource.query).toHaveBeenCalled();
  });

  it('elimina logicamente un campo dinamico', async () => {
    await service.eliminarDefinicionCampo('018f0000-0000-7000-8000-000000000003', 1);
    expect(mockCampoRepo.save).toHaveBeenCalled();
  });
});
