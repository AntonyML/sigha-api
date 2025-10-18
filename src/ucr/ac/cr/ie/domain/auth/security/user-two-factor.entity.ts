import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('user_two_factor')
export class UserTwoFactor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  tfaSecret: string;

  @Column({ default: false })
  tfaEnabled: boolean;

  @Column({ nullable: true, type: 'text' })
  tfaBackupCodes?: string; // JSON array as string

  @Column({ nullable: true, type: 'timestamp' })
  tfaLastUsed?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User, user => user.twoFactor)
  @JoinColumn({ name: 'userId' })
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