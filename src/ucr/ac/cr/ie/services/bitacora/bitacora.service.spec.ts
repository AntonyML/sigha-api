import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import {
  BitacoraCategoria,
  BitacoraVisibilidad,
  BitacoraUrgencia,
  BitacoraEstado,
} from '../../domain/bitacora';

describe('BitacoraService', () => {
  let service: BitacoraService;
  let mockEntradaRepo: any;
  let mockAcuseRepo: any;
  let mockPerfilRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockEntradaRepo = {
      create: mock((dto: any) => ({
        id: 101,
        ...dto,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      })),
      save: mock((entity: any) => Promise.resolve({ id: 101, ...entity })),
      findOne: mock(async ({ where }: any) => {
        if (where?.id === 101) {
          return {
            id: 101,
            titulo: 'Nota inicial',
            contenido: 'Paciente estable',
            estado: BitacoraEstado.PUBLICADO,
            perfilId: '018f0000-0000-7000-8000-000000000001',
            autorId: 1,
            acuses: [],
          };
        }
        return null;
      }),
      createQueryBuilder: mock(() => ({
        leftJoinAndSelect: mock().mockReturnThis(),
        where: mock().mockReturnThis(),
        andWhere: mock().mockReturnThis(),
        orderBy: mock().mockReturnThis(),
        addOrderBy: mock().mockReturnThis(),
        take: mock().mockReturnThis(),
        skip: mock().mockReturnThis(),
        getManyAndCount: mock(async () => [[{ id: 101, titulo: 'Test entry' }], 1]),
        getMany: mock(async () => [{ id: 101, titulo: 'Test entry' }]),
      })),
    };

    mockAcuseRepo = {
      create: mock((dto: any) => ({ id: 501, ...dto, creadoEn: new Date() })),
      save: mock((entity: any) => Promise.resolve({ id: 501, ...entity })),
      findOne: mock(async () => null),
    };

    mockPerfilRepo = {
      findOne: mock(async ({ where }: any) => ({
        id: where?.id || '018f0000-0000-7000-8000-000000000001',
        estado: 'activo',
      })),
    };

    mockUserRepo = {
      findOne: mock(async ({ where }: any) => {
        if (where?.id === 1) {
          return { id: 1, uName: 'Dra. Sofia', uFLastName: 'Ramirez', uIsActive: true };
        }
        return null;
      }),
    };

    service = new BitacoraService(
      mockEntradaRepo,
      mockAcuseRepo,
      mockPerfilRepo,
      mockUserRepo,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('crea una nueva entrada de bitacora asociada a un perfil', async () => {
    const res = await service.crearEntrada(
      {
        perfilId: '018f0000-0000-7000-8000-000000000001',
        titulo: 'Reporte del turno',
        contenido: 'Signos vitales normales en ronda matutina',
        categoria: BitacoraCategoria.CLINICO,
        visibilidad: BitacoraVisibilidad.CLINICA,
        urgencia: BitacoraUrgencia.MEDIA,
        requiereAcuse: true,
      },
      1,
      1,
    );

    expect(res).toBeDefined();
    expect(res.id).toBe(101);
    expect(mockEntradaRepo.create).toHaveBeenCalled();
    expect(mockEntradaRepo.save).toHaveBeenCalled();
  });

  it('lanza NotFoundException cuando el autor no existe', async () => {
    mockUserRepo.findOne = mock(async () => null);

    expect(
      service.crearEntrada(
        {
          perfilId: '018f0000-0000-7000-8000-000000000001',
          contenido: 'Contenido test',
        },
        999,
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('actualiza el estado de una entrada', async () => {
    const res = await service.actualizarEstado(101, { estado: BitacoraEstado.RESUELTO }, 1);
    expect(res.estado).toBe(BitacoraEstado.RESUELTO);
    expect(mockEntradaRepo.save).toHaveBeenCalled();
  });

  it('registra acuse de recibo de lectura', async () => {
    const res = await service.registrarAcuse(101, 1, { comentario: 'Enterado y revisado' });
    expect(res).toBeDefined();
    expect(res.id).toBe(501);
    expect(mockAcuseRepo.create).toHaveBeenCalled();
  });
});
