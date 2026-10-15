import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

@Entity('resident_program_enrollments')
export class ResidentProgramEnrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'integer' })
  tenantId!: number;

  @Column({ name: 'id_older_adult', type: 'integer' })
  idOlderAdult!: number;

  @Column({ name: 'subprogram_id', type: 'integer' })
  subprogramId!: number;

  @Column({ name: 'scale_evaluation_id', type: 'integer', nullable: true })
  scaleEvaluationId?: number | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: EnrollmentStatus;

  @Column({ type: 'text', nullable: true })
  goals?: string | null;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date | null;

  @Column({ name: 'created_by', type: 'integer', nullable: true })
  createdBy?: number | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
