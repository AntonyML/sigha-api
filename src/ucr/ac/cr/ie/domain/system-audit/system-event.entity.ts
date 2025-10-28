import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum SystemEventType {
  APPLICATION_START = 'application_start',
  APPLICATION_STOP = 'application_stop',
  DATABASE_CONNECTION = 'database_connection',
  DATABASE_DISCONNECTION = 'database_disconnection',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  ERROR_OCCURRED = 'error_occurred',
  PERFORMANCE_WARNING = 'performance_warning',
  MEMORY_WARNING = 'memory_warning',
  DISK_SPACE_WARNING = 'disk_space_warning',
  BACKUP_STARTED = 'backup_started',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  MAINTENANCE_STARTED = 'maintenance_started',
  MAINTENANCE_COMPLETED = 'maintenance_completed',
  CONFIGURATION_CHANGE = 'configuration_change',
  OTHER = 'other'
}

export enum SystemSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

@Entity('system_events')
export class SystemEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: SystemEventType,
    default: SystemEventType.OTHER
  })
  eventType: SystemEventType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: SystemSeverity,
    default: SystemSeverity.INFO
  })
  severity: SystemSeverity;

  @Column({ name: 'component', length: 100, nullable: true })
  component: string;

  @Column({ name: 'method', length: 100, nullable: true })
  method: string;

  @Column({ name: 'endpoint', length: 255, nullable: true })
  endpoint: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'memory_usage_mb', nullable: true })
  memoryUsageMb: number;

  @Column({ name: 'cpu_usage_percent', nullable: true })
  cpuUsagePercent: number;

  @Column({ name: 'request_size_bytes', nullable: true })
  requestSizeBytes: number;

  @Column({ name: 'response_size_bytes', nullable: true })
  responseSizeBytes: number;

  @Column({ name: 'http_status_code', nullable: true })
  httpStatusCode: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: any;

  @Column({ name: 'correlation_id', length: 36, nullable: true })
  correlationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}