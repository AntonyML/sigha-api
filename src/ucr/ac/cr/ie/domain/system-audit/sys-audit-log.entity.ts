import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type SystemAuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

@Entity('sys_audit_logs')
export class SysAuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId!: number;

  @Column({ name: 'table_name', type: 'text' })
  tableName!: string;

  @Column({ name: 'record_id', type: 'text' })
  recordId!: string;

  @Column({ type: 'varchar', length: 8 })
  action!: SystemAuditAction;

  @Column({ name: 'actor_user_id', type: 'integer', nullable: true })
  actorUserId?: number | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: Record<string, unknown> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: Record<string, unknown> | null;
}
