import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum AuditReportType {
  GENERAL_ACTIONS = 'general_actions',
  ROLE_CHANGES = 'role_changes',
  OLDER_ADULT_UPDATES = 'older_adult_updates',
  SYSTEM_ACCESS = 'system_access',
  OTHER = 'other'
}

@Entity('audit_reports')
export class AuditReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ar_audit_number', unique: true })
  arAuditNumber: number;

  @Column({ 
    name: 'ar_type', 
    type: 'enum',
    enum: AuditReportType,
    default: AuditReportType.OTHER 
  })
  arType: AuditReportType;

  @Column({ name: 'ar_start_date', type: 'datetime' })
  arStartDate: Date;

  @Column({ name: 'ar_end_date', type: 'datetime' })
  arEndDate: Date;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;

  @Column({ name: 'id_generator' })
  idGenerator: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_generator' })
  generator: User;
}
