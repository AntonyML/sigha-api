import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum AuditLogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  OTHER = 'other'
}

export enum AuditEntity {
  USER = 'user',
  ROLE = 'role',
  PROGRAM = 'program',
  SUB_PROGRAM = 'sub_program',
  OLDER_ADULT = 'older_adult',
  CLINICAL_HISTORY = 'clinical_history',
  MEDICAL_RECORD = 'medical_record',
  APPOINTMENT = 'appointment',
  NOTIFICATION = 'notification',
  ENTRANCE_EXIT = 'entrance_exit',
  AUDIT_REPORT = 'audit_report',
  OTHER = 'other'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'action',
    type: 'enum',
    enum: AuditLogAction,
    default: AuditLogAction.OTHER
  })
  action: AuditLogAction;

  @Column({
    name: 'entity_name',
    type: 'enum',
    enum: AuditEntity,
    default: AuditEntity.OTHER
  })
  entityName: AuditEntity;

  @Column({ name: 'entity_id', nullable: true })
  entityId: number;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}