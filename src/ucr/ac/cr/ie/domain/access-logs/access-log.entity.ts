import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type AccessEventType = 'exit' | 'return' | 'visit';

@Entity('access_logs')
export class AccessLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId!: number;

  @Column({ name: 'id_older_adult', type: 'integer', nullable: true })
  idOlderAdult?: number | null;

  @Column({ name: 'event_type', type: 'varchar', length: 16 })
  eventType!: AccessEventType;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'expected_return_at', type: 'timestamptz', nullable: true })
  expectedReturnAt?: Date | null;

  @Column({ name: 'visitor_name', length: 200, nullable: true })
  visitorName?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'recorded_by', type: 'integer', nullable: true })
  recordedBy?: number | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
