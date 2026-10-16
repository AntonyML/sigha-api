import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import type { BitacoraEntrada } from './bitacora-entrada.entity';

@Entity({ schema: 'operacion', name: 'bitacora_acuse' })
export class BitacoraAcuse {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'entrada_id', type: 'bigint' })
  entradaId: number;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'fecha_lectura', type: 'timestamptz' })
  fechaLectura: Date;

  @Column({ type: 'varchar', length: 255, default: '' })
  comentario: string;

  @ManyToOne('BitacoraEntrada', (entrada: any) => entrada.acuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entrada_id' })
  entrada?: BitacoraEntrada;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  constructor(partial?: Partial<BitacoraAcuse>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
