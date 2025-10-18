import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('user_two_factor')
export class UserTwoFactor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'tfa_secret' })
  tfaSecret: string;

  @Column({ name: 'tfa_enabled', default: false })
  tfaEnabled: boolean;

  @Column({ name: 'tfa_backup_codes', nullable: true, type: 'text' })
  tfaBackupCodes?: string; // JSON array as string

  @Column({ name: 'tfa_last_used', nullable: true, type: 'timestamp' })
  tfaLastUsed?: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User, user => user.twoFactor)
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(
    id: number,
    userId: number,
    tfaSecret: string,
    tfaEnabled: boolean = false,
    tfaBackupCodes?: string,
    tfaLastUsed?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.tfaSecret = tfaSecret;
    this.tfaEnabled = tfaEnabled;
    this.tfaBackupCodes = tfaBackupCodes;
    this.tfaLastUsed = tfaLastUsed;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}