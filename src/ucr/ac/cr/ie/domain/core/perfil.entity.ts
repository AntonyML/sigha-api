import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { PersonaRol } from './persona-rol.entity';
import type { PerfilDigital } from './perfil-digital.entity';

export enum PerfilEstado {
  ACTIVO = 'activo',
  EGRESADO = 'egresado',
  FALLECIDO = 'fallecido',
  SUSPENDIDO = 'suspendido',
}

@Entity({ schema: 'core', name: 'perfil' })
export class Perfil {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_rol_id', type: 'uuid', unique: true })
  personaRolId: string;

  @Column({ type: 'varchar', length: 30, default: PerfilEstado.ACTIVO })
  estado: string;

  @Column({ name: 'fecha_ingreso', type: 'date', default: () => 'CURRENT_DATE' })
  fechaIngreso: string | Date;

  @Column({ name: 'fecha_egreso', type: 'date', nullable: true })
  fechaEgreso?: string | Date;

  @Column({ name: 'motivo_egreso', type: 'text', nullable: true })
  motivoEgreso?: string;

  @Column({ name: 'cama_actual_id', type: 'uuid', nullable: true })
  camaActualId?: string;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne('PersonaRol', (pr: any) => pr.perfil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_rol_id' })
  personaRol?: PersonaRol;

  @OneToOne('PerfilDigital', (pd: any) => pd.perfil, { cascade: true })
  perfilDigital?: PerfilDigital;

  constructor(partial?: Partial<Perfil>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
