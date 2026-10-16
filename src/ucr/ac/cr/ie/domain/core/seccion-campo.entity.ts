import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PlantillaPerfil } from './plantilla-perfil.entity';
import { DefinicionCampo } from './definicion-campo.entity';

@Entity({ schema: 'core', name: 'seccion_campo' })
export class SeccionCampo {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'plantilla_id', type: 'uuid' })
  plantillaId: string;

  @Column({ type: 'varchar', length: 60 })
  clave: string;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icono?: string;

  @Column({ type: 'integer', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PlantillaPerfil, (p) => p.secciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plantilla_id' })
  plantilla: PlantillaPerfil;

  @OneToMany(() => DefinicionCampo, (c) => c.seccion, { cascade: true })
  campos: DefinicionCampo[];

  constructor(partial?: Partial<SeccionCampo>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
