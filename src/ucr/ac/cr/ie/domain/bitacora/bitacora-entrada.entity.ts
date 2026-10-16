import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Perfil } from '../core/perfil.entity';
import { User } from '../auth/core/user.entity';
import { BitacoraAcuse } from './bitacora-acuse.entity';
import {
  BitacoraCategoria,
  BitacoraVisibilidad,
  BitacoraUrgencia,
  BitacoraEstado,
} from './bitacora.enums';

@Entity({ schema: 'operacion', name: 'bitacora_entrada' })
export class BitacoraEntrada {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'perfil_id', type: 'uuid', nullable: true })
  perfilId?: string;

  @Column({ name: 'autor_id', type: 'integer' })
  autorId: number;

  @Column({ name: 'padre_id', type: 'bigint', nullable: true })
  padreId?: number;

  @Column({ type: 'varchar', length: 200, default: '' })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', length: 50, default: BitacoraCategoria.GENERAL })
  categoria: string;

  @Column({ type: 'varchar', length: 30, default: BitacoraVisibilidad.GENERAL })
  visibilidad: string;

  @Column({ type: 'varchar', length: 20, default: BitacoraUrgencia.BAJA })
  urgencia: string;

  @Column({ type: 'varchar', length: 30, default: BitacoraEstado.PUBLICADO })
  estado: string;

  @Column({ name: 'requiere_acuse', type: 'boolean', default: false })
  requiereAcuse: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  adjuntos: any[];

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Perfil, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'perfil_id' })
  perfil?: Perfil;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @ManyToOne(() => BitacoraEntrada, (entrada) => entrada.respuestas, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'padre_id' })
  padre?: BitacoraEntrada;

  @OneToMany(() => BitacoraEntrada, (entrada) => entrada.padre)
  respuestas: BitacoraEntrada[];

  @OneToMany(() => BitacoraAcuse, (acuse) => acuse.entrada, { cascade: true })
  acuses: BitacoraAcuse[];

  constructor(partial?: Partial<BitacoraEntrada>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
