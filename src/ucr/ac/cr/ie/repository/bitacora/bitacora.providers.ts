import { DataSource } from 'typeorm';
import { BitacoraEntrada, BitacoraAcuse } from '../../domain/bitacora';

export const bitacoraProviders = [
  {
    provide: 'BitacoraEntradaRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BitacoraEntrada),
    inject: ['DataSource'],
  },
  {
    provide: 'BitacoraAcuseRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BitacoraAcuse),
    inject: ['DataSource'],
  },
];
