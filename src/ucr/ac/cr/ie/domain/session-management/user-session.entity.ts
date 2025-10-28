import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended'
}

export enum SessionType {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  ADMIN = 'admin'
}

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'session_token', unique: true, length: 512 })
  sessionToken: string;

  @Column({ name: 'refresh_token', unique: true, length: 512, nullable: true })
  refreshToken: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE
  })
  status: SessionStatus;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: SessionType,
    default: SessionType.WEB
  })
  sessionType: SessionType;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_info', type: 'json', nullable: true })
  deviceInfo: any;

  @Column({ name: 'location_info', type: 'json', nullable: true })
  locationInfo: any;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'last_activity_at' })
  lastActivityAt: Date;

  @Column({ name: 'login_at' })
  loginAt: Date;

  @Column({ name: 'logout_at', nullable: true })
  logoutAt: Date;

  @Column({ name: 'login_attempts', default: 0 })
  loginAttempts: number;

  @Column({ name: 'is_secure', default: false })
  isSecure: boolean;

  @Column({ name: 'two_factor_verified', default: false })
  twoFactorVerified: boolean;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones (opcionales)
  // @ManyToOne(() => User, { nullable: false })
  // @JoinColumn({ name: 'user_id' })
  // user?: User;
}