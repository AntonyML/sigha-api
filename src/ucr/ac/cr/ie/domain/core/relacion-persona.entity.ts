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

@Entity({ schema: 'core', name: 'relacion_persona' })
export class RelacionPersona {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_origen_id', type: 'uuid' })
  personaOrigenId: string;

  @Column({ name: 'persona_destino_id', type: 'uuid' })
  personaDestinoId: string;

  @Column({ type: 'varchar', length: 50 })
  parentesco: string;

  @Column({ name: 'es_responsable_legal', type: 'boolean', default: false })
  esResponsableLegal: boolean;

  @Column({ name: 'es_contacto_emergencia', type: 'boolean', default: false })
  esContactoEmergencia: boolean;

  @Column({ name: 'prioridad_llamada', type: 'integer', default: 1 })
  prioridadLlamada: number;

  @Column({ name: 'vive_con_persona', type: 'boolean', default: false })
  viveConPersona: boolean;

  @Column({ type: 'text', default: '' })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne('Persona', (p: any) => p.relacionesOrigen, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_origen_id' })
  personaOrigen?: Persona;

  @ManyToOne('Persona', (p: any) => p.relacionesDestino, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_destino_id' })
  personaDestino?: Persona;

  constructor(partial?: Partial<RelacionPersona>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
