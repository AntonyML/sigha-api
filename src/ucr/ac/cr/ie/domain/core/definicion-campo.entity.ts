import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SeccionCampo } from './seccion-campo.entity';

export enum TipoCampoDinamico {
  TEXTO = 'texto',
  NUMERO = 'numero',
  DECIMAL = 'decimal',
  FECHA = 'fecha',
  HORA = 'hora',
  BOOLEANO = 'booleano',
  OPCION_SIMPLE = 'opcion_simple',
  OPCION_MULTIPLE = 'opcion_multiple',
  AREA_TEXTO = 'area_texto',
  ARCHIVO = 'archivo',
  JSON = 'json',
}

@Entity({ schema: 'core', name: 'definicion_campo' })
export class DefinicionCampo {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId: number;

  @Column({ name: 'seccion_id', type: 'uuid' })
  seccionId: string;

  @Column({ type: 'varchar', length: 60 })
  clave: string;

  @Column({ type: 'varchar', length: 150 })
  etiqueta: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'varchar', length: 30 })
  tipo: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  opciones: any[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  validacion: Record<string, any>;

  @Column({ name: 'valor_defecto', type: 'jsonb', nullable: true })
  valorDefecto?: any;

  @Column({ type: 'boolean', default: false })
  obligatorio: boolean;

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @Column({ type: 'boolean', default: true })
  editable: boolean;

  @Column({ type: 'integer', default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: false })
  indexado: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SeccionCampo, (s) => s.campos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: SeccionCampo;

  constructor(partial?: Partial<DefinicionCampo>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
