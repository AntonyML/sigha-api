import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

export enum LoginFailureReason {
  INVALID_PASSWORD = 'invalid_password',
  INVALID_2FA = 'invalid_2fa',
  USER_NOT_FOUND = 'user_not_found',
  USER_INACTIVE = 'user_inactive',
  ACCOUNT_LOCKED = 'account_locked',
}

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @Column({ name: 'email', length: 256 })
  email: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'attempt_successful', default: false })
  attemptSuccessful: boolean;

  @Column({ name: 'failure_reason', length: 100, nullable: true })
  failureReason?: string;

  @Column({ name: 'attempted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  attemptedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  constructor(
    id: number,
    email: string,
    attemptSuccessful: boolean = false,
    userId?: number,
    ipAddress?: string,
    failureReason?: string,
    attemptedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId ?? null;
    this.email = email;
    this.ipAddress = ipAddress;
    this.attemptSuccessful = attemptSuccessful;
    this.failureReason = failureReason;
    this.attemptedAt = attemptedAt || new Date();
  }
}
