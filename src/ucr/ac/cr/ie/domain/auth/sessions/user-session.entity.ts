import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'session_token' })
  sessionToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(
    id?: number,
    userId?: number,
    sessionToken?: string,
    expiresAt?: Date,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
    isActive?: boolean,
    createdAt?: Date,
    lastActivity?: Date
  ) {
    if (id !== undefined) this.id = id;
    if (userId !== undefined) this.userId = userId;
    if (sessionToken !== undefined) this.sessionToken = sessionToken;
    if (expiresAt !== undefined) this.expiresAt = expiresAt;
    if (refreshToken !== undefined) this.refreshToken = refreshToken;
    if (ipAddress !== undefined) this.ipAddress = ipAddress;
    if (userAgent !== undefined) this.userAgent = userAgent;
    if (isActive !== undefined) this.isActive = isActive;
    if (createdAt !== undefined) this.createdAt = createdAt;
    if (lastActivity !== undefined) this.lastActivity = lastActivity;
  }
}