import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  sessionToken: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  constructor(
    id: number,
    userId: number,
    sessionToken: string,
    expiresAt: Date,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
    isActive: boolean = true,
    createdAt?: Date,
    lastActivity?: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.sessionToken = sessionToken;
    this.refreshToken = refreshToken;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.isActive = isActive;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt || new Date();
    this.lastActivity = lastActivity || new Date();
  }
}