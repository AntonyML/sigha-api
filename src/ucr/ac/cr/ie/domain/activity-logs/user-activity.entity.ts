import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  SEARCH = 'search',
  NAVIGATION = 'navigation',
  OTHER = 'other'
}

export enum ActivityCategory {
  AUTHENTICATION = 'authentication',
  DATA_MANAGEMENT = 'data_management',
  SYSTEM_ACCESS = 'system_access',
  REPORTING = 'reporting',
  ADMINISTRATION = 'administration',
  CLINICAL = 'clinical',
  GENERAL = 'general'
}

@Entity('user_activities')
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.OTHER
  })
  activityType: ActivityType;

  @Column({
    name: 'category',
    type: 'enum',
    enum: ActivityCategory,
    default: ActivityCategory.GENERAL
  })
  category: ActivityCategory;

  @Column({ name: 'entity_name', length: 100, nullable: true })
  entityName: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: number;

  @Column({ name: 'action_description', type: 'text', nullable: true })
  actionDescription: string;

  @Column({ name: 'old_data', type: 'json', nullable: true })
  oldData: any;

  @Column({ name: 'new_data', type: 'json', nullable: true })
  newData: any;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number;

  @Column({ name: 'success', default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}