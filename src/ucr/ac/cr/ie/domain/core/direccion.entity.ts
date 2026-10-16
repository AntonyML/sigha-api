import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Persona } from './persona.entity';

@Entity({ schema: 'core', name: 'direccion' })
export class Direccion {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId: string;

  @Column({ type: 'varchar', length: 60, default: 'Costa Rica' })
  pais: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  provincia?: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  canton?: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  distrito?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barrio?: string;

  @Column({ name: 'direccion_exacta', type: 'text' })
  direccionExacta: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 20, nullable: true })
  codigoPostal?: string;

  @Column({ name: 'es_residencia_actual', type: 'boolean', default: true })
  esResidenciaActual: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne('Persona', (p: any) => p.direcciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona?: Persona;

  constructor(partial?: Partial<Direccion>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
