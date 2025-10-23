import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum AuditReportType {
  GENERAL_ACTIONS = 'general_actions',
  ROLE_CHANGES = 'role_changes',
  OLDER_ADULT_UPDATES = 'older_adult_updates',
  SYSTEM_ACCESS = 'system_access',
  LOGIN_ATTEMPTS = 'login_attempts',
  PASSWORD_RESETS = 'password_resets',
  CLINICAL_RECORD_CHANGES = 'clinical_record_changes',
  NOTIFICATIONS = 'notifications',
  OTHER = 'other'
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  OTHER = 'other'
}

@Entity('audit_reports')
export class AuditReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ar_audit_number', unique: true, nullable: true })
  arAuditNumber: number;

  @Column({ 
    name: 'ar_type', 
    type: 'enum',
    enum: AuditReportType,
    default: AuditReportType.OTHER 
  })
  arType: AuditReportType;

  @Column({ name: 'ar_entity_name', length: 100, nullable: true })
  arEntityName: string;

  @Column({ name: 'ar_entity_id', nullable: true })
  arEntityId: number;

  @Column({ 
    name: 'ar_action', 
    type: 'enum',
    enum: AuditAction,
    default: AuditAction.OTHER 
  })
  arAction: AuditAction;

  @Column({ name: 'ar_old_value', type: 'text', nullable: true })
  arOldValue: string;

  @Column({ name: 'ar_new_value', type: 'text', nullable: true })
  arNewValue: string;

  @Column({ name: 'ar_observations', type: 'text', nullable: true })
  arObservations: string;

  @Column({ name: 'ar_start_date', type: 'datetime' })
  arStartDate: Date;

  @Column({ name: 'ar_end_date', type: 'datetime', nullable: true })
  arEndDate: Date;

  @Column({ name: 'ar_duration_seconds', nullable: true })
  arDurationSeconds: number;

  @Column({ name: 'ar_ip_address', length: 45, nullable: true })
  arIpAddress: string;

  @Column({ name: 'ar_user_agent', type: 'text', nullable: true })
  arUserAgent: string;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;

  @Column({ name: 'id_generator', nullable: true })
  idGenerator: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_generator' })
  generator: User;
}
