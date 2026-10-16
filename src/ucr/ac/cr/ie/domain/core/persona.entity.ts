import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DocumentoIdentidad } from './documento-identidad.entity';
import { MedioContacto } from './medio-contacto.entity';
import { Direccion } from './direccion.entity';
import { RelacionPersona } from './relacion-persona.entity';
import { PersonaRol } from './persona-rol.entity';

export enum SexoBiologico {
  FEMENINO = 'femenino',
  MASCULINO = 'masculino',
  INTERSEXUAL = 'intersexual',
  NO_ESPECIFICADO = 'no_especificado',
}

@Entity({ schema: 'core', name: 'persona' })
export class Persona {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'primer_apellido', type: 'varchar', length: 100 })
  primerApellido: string;

  @Column({ name: 'segundo_apellido', type: 'varchar', length: 100, nullable: true, default: '' })
  segundoApellido?: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 300, insert: false, update: false })
  nombreCompleto: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento?: string | Date;

  @Column({ type: 'varchar', length: 20, default: SexoBiologico.NO_ESPECIFICADO })
  sexo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  genero?: string;

  @Column({ name: 'estado_civil', type: 'varchar', length: 30, nullable: true })
  estadoCivil?: string;

  @Column({ type: 'varchar', length: 80, default: 'Costarricense' })
  nacionalidad: string;

  @Column({ name: 'foto_url', type: 'text', nullable: true })
  fotoUrl?: string;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => DocumentoIdentidad, (doc) => doc.persona, { cascade: true })
  documentos: DocumentoIdentidad[];

  @OneToMany(() => MedioContacto, (contacto) => contacto.persona, { cascade: true })
  contactos: MedioContacto[];

  @OneToMany(() => Direccion, (dir) => dir.persona, { cascade: true })
  direcciones: Direccion[];

  @OneToMany(() => PersonaRol, (rol) => rol.persona, { cascade: true })
  roles: PersonaRol[];

  @OneToMany(() => RelacionPersona, (rel) => rel.personaOrigen)
  relacionesOrigen: RelacionPersona[];

  @OneToMany(() => RelacionPersona, (rel) => rel.personaDestino)
  relacionesDestino: RelacionPersona[];

  constructor(partial?: Partial<Persona>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
