import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SeccionCampo } from './seccion-campo.entity';

@Entity({ schema: 'core', name: 'plantilla_perfil' })
export class PlantillaPerfil {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'rol_aplicable', type: 'varchar', length: 40, default: 'RESIDENTE' })
  rolAplicable: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ name: 'es_vigente', type: 'boolean', default: true })
  esVigente: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SeccionCampo, (s) => s.plantilla, { cascade: true })
  secciones: SeccionCampo[];

  constructor(partial?: Partial<PlantillaPerfil>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
