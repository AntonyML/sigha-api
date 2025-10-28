import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REMOVE = 'role_remove',
  PERMISSION_CHANGE = 'permission_change',
  DATA_ACCESS = 'data_access',
  DATA_MODIFY = 'data_modify',
  DATA_DELETE = 'data_delete',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  FILE_DELETE = 'file_delete',
  REPORT_GENERATE = 'report_generate',
  SETTINGS_CHANGE = 'settings_change',
  SECURITY_ALERT = 'security_alert',
  API_ACCESS = 'api_access',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  OTHER = 'other'
}

export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.OTHER
  })
  activityType: ActivityType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: ActivitySeverity,
    default: ActivitySeverity.LOW
  })
  severity: ActivitySeverity;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'entity_type', length: 100, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: number;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: any;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', length: 255, nullable: true })
  sessionId: string;

  @Column({ name: 'correlation_id', length: 36, nullable: true })
  correlationId: string;

  @Column({ name: 'request_id', length: 36, nullable: true })
  requestId: string;

  @Column({ name: 'endpoint', length: 255, nullable: true })
  endpoint: string;

  @Column({ name: 'method', length: 10, nullable: true })
  method: string;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'success', default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'tags', type: 'json', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones (opcionales, dependiendo de si tienes las entidades User)
  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'user_id' })
  // user?: User;
}