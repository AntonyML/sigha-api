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

@Entity({ schema: 'core', name: 'documento_identidad' })
export class DocumentoIdentidad {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId: string;

  @Column({ type: 'varchar', length: 30 })
  tipo: string;

  @Column({ type: 'varchar', length: 60 })
  numero: string;

  @Column({ name: 'es_principal', type: 'boolean', default: true })
  esPrincipal: boolean;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento?: string | Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne('Persona', (p: any) => p.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona?: Persona;

  constructor(partial?: Partial<DocumentoIdentidad>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
