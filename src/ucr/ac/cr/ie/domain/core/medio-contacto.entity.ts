import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Persona } from './persona.entity';

@Entity({ schema: 'core', name: 'medio_contacto' })
export class MedioContacto {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId: string;

  @Column({ type: 'varchar', length: 30 })
  tipo: string;

  @Column({ type: 'varchar', length: 150 })
  valor: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal: boolean;

  @Column({ type: 'varchar', length: 150, default: '' })
  observacion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne('Persona', (p: any) => p.contactos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona?: Persona;

  constructor(partial?: Partial<MedioContacto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
