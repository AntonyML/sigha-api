import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { RolPersonaTipo, SexoBiologico } from '../../domain/core';

describe('PersonaService', () => {
  let service: PersonaService;
  let mockPersonaRepo: any;
  let mockDocRepo: any;
  let mockContactoRepo: any;
  let mockDirRepo: any;
  let mockRolRepo: any;
  let mockPerfilRepo: any;
  let mockPerfilDigitalRepo: any;
  let mockPlantillaRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockPersonaRepo = {
      findOne: mock(async ({ where }: any) => {
        if (where?.id === '018f0000-0000-7000-8000-000000000010') {
          return {
            id: '018f0000-0000-7000-8000-000000000010',
            nombre: 'Elena',
            primerApellido: 'Vargas',
            segundoApellido: 'Soto',
            nombreCompleto: 'Elena Vargas Soto',
            tenantId: 1,
            roles: [
              {
                id: '018f0000-0000-7000-8000-000000000011',
                rol: RolPersonaTipo.RESIDENTE,
                perfil: {
                  id: '018f0000-0000-7000-8000-000000000012',
                  estado: 'activo',
                  perfilDigital: {
                    datos: { escolaridad: 'Primaria' },
                  },
                },
              },
            ],
            documentos: [],
            contactos: [],
            direcciones: [],
          };
        }
        return null;
      }),
      save: mock((entity: any) => Promise.resolve(entity)),
      createQueryBuilder: mock(() => ({
        leftJoinAndSelect: mock().mockReturnThis(),
        where: mock().mockReturnThis(),
        andWhere: mock().mockReturnThis(),
        orderBy: mock().mockReturnThis(),
        take: mock().mockReturnThis(),
        skip: mock().mockReturnThis(),
        getManyAndCount: mock(async () => [
          [{ id: '018f0000-0000-7000-8000-000000000010', nombreCompleto: 'Elena Vargas Soto' }],
          1,
        ]),
      })),
    };

    mockDocRepo = { findOne: mock(async () => null) };
    mockContactoRepo = { findOne: mock(async () => null) };
    mockDirRepo = { findOne: mock(async () => null) };
    mockRolRepo = { findOne: mock(async () => null) };
    mockPerfilRepo = {
      findOne: mock(async () => null),
      save: mock((entity: any) => Promise.resolve(entity)),
    };
    mockPerfilDigitalRepo = { findOne: mock(async () => null) };
    mockPlantillaRepo = { findOne: mock(async () => ({ id: '018f0000-0000-7000-8000-000000000001' })) };

    mockDataSource = {
      transaction: mock(async (cb: any) => {
        const fakeManager = {
          getRepository: mock((entityClass: any) => ({
            findOne: mock(async () => null),
          })),
          query: mock(async (sql: string, params: any[]) => {
            if (sql.includes('INSERT INTO core.persona')) {
              return [{ id: '018f0000-0000-7000-8000-000000000010', nombre_completo: 'Elena Vargas Soto' }];
            }
            if (sql.includes('INSERT INTO core.persona_rol')) {
              return [{ id: '018f0000-0000-7000-8000-000000000011' }];
            }
            if (sql.includes('INSERT INTO core.perfil (')) {
              return [{ id: '018f0000-0000-7000-8000-000000000012' }];
            }
            return [];
          }),
        };
        return cb(fakeManager);
      }),
      query: mock(async () => []),
    };

    service = new PersonaService(
      mockPersonaRepo,
      mockDocRepo,
      mockContactoRepo,
      mockDirRepo,
      mockRolRepo,
      mockPerfilRepo,
      mockPerfilDigitalRepo,
      mockPlantillaRepo,
      mockDataSource,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('obtiene una persona por id con sus relaciones completas', async () => {
    const persona = await service.obtenerPorId('018f0000-0000-7000-8000-000000000010');
    expect(persona).toBeDefined();
    expect(persona.nombre).toBe('Elena');
    expect(persona.roles.length).toBe(1);
    expect(persona.roles[0].rol).toBe(RolPersonaTipo.RESIDENTE);
  });

  it('lanza NotFoundException cuando la persona no existe', async () => {
    expect(service.obtenerPorId('uuid-inexistente')).rejects.toThrow(NotFoundException);
  });

  it('lista personas con paginacion y filtros', async () => {
    const res = await service.listarPersonas(1, { rol: 'RESIDENTE', busqueda: 'Elena' });
    expect(res.total).toBe(1);
    expect(res.data.length).toBe(1);
  });

  it('crea una persona integralmente con rol y perfil', async () => {
    const persona = await service.crearPersona(
      {
        nombre: 'Elena',
        primerApellido: 'Vargas',
        segundoApellido: 'Soto',
        sexo: SexoBiologico.FEMENINO,
        rol: RolPersonaTipo.RESIDENTE,
        documento: {
          tipo: 'cedula',
          numero: '1-1234-5678',
        },
        contacto: {
          tipo: 'telefono',
          valor: '8888-8888',
        },
        direccion: {
          direccionExacta: 'San Jose, Costa Rica',
        },
        perfilDigital: {
          escolaridad: 'Primaria',
        },
      },
      1,
    );

    expect(persona).toBeDefined();
    expect(mockDataSource.transaction).toHaveBeenCalled();
  });

  it('elimina logicamente una persona', async () => {
    await service.eliminarPersona('018f0000-0000-7000-8000-000000000010');
    expect(mockPersonaRepo.save).toHaveBeenCalled();
  });
});
