import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Perfil } from './perfil.entity';
import { PlantillaPerfil } from './plantilla-perfil.entity';

@Entity({ schema: 'core', name: 'perfil_digital' })
export class PerfilDigital {
  @PrimaryColumn({ name: 'perfil_id', type: 'uuid' })
  perfilId: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'plantilla_id', type: 'uuid' })
  plantillaId: string;

  @Column({ name: 'plantilla_version', type: 'integer', default: 1 })
  plantillaVersion: number;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  datos: Record<string, any>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne('Perfil', (p: any) => p.perfilDigital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perfil_id' })
  perfil?: Perfil;

  @ManyToOne(() => PlantillaPerfil, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plantilla_id' })
  plantilla: PlantillaPerfil;

  constructor(partial?: Partial<PerfilDigital>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
