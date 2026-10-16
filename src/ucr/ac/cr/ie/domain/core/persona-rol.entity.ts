import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Persona } from './persona.entity';
import type { Perfil } from './perfil.entity';

export enum RolPersonaTipo {
  RESIDENTE = 'RESIDENTE',
  CONTACTO = 'CONTACTO',
  PERSONAL = 'PERSONAL',
  PACIENTE_AMBULATORIO = 'PACIENTE_AMBULATORIO',
}

@Entity({ schema: 'core', name: 'persona_rol' })
export class PersonaRol {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId: string;

  @Column({ type: 'varchar', length: 40 })
  rol: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  desde: string | Date;

  @Column({ type: 'date', nullable: true })
  hasta?: string | Date;

  @Column({ type: 'varchar', length: 30, default: 'activo' })
  estado: string;

  @Column({ type: 'text', default: '' })
  notas: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne('Persona', (p: any) => p.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona?: Persona;

  @OneToOne('Perfil', (perf: any) => perf.personaRol)
  perfil?: Perfil;

  constructor(partial?: Partial<PersonaRol>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
