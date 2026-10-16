import { DataSource } from 'typeorm';
import {
  Persona,
  DocumentoIdentidad,
  MedioContacto,
  Direccion,
  RelacionPersona,
  PersonaRol,
  Perfil,
  PerfilDigital,
  PlantillaPerfil,
  SeccionCampo,
  DefinicionCampo,
} from '../../domain/core';

export const coreProviders = [
  {
    provide: 'PersonaRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Persona),
    inject: ['DataSource'],
  },
  {
    provide: 'DocumentoIdentidadRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DocumentoIdentidad),
    inject: ['DataSource'],
  },
  {
    provide: 'MedioContactoRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MedioContacto),
    inject: ['DataSource'],
  },
  {
    provide: 'DireccionRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Direccion),
    inject: ['DataSource'],
  },
  {
    provide: 'RelacionPersonaRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RelacionPersona),
    inject: ['DataSource'],
  },
  {
    provide: 'PersonaRolRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PersonaRol),
    inject: ['DataSource'],
  },
  {
    provide: 'PerfilRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Perfil),
    inject: ['DataSource'],
  },
  {
    provide: 'PerfilDigitalRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PerfilDigital),
    inject: ['DataSource'],
  },
  {
    provide: 'PlantillaPerfilRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PlantillaPerfil),
    inject: ['DataSource'],
  },
  {
    provide: 'SeccionCampoRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SeccionCampo),
    inject: ['DataSource'],
  },
  {
    provide: 'DefinicionCampoRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DefinicionCampo),
    inject: ['DataSource'],
  },
];
