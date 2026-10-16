import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { UserSession } from '../sessions/user-session.entity';
import { UserTwoFactor } from '../security/user-two-factor.entity';

/**
 * Platform-plane role. Lives outside the organization role catalog: a user
 * with a platform role manages the SaaS itself, not a single organization.
 */
export enum PlatformRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'u_identification', unique: true, nullable: false })
  uIdentification: string;

  @Column({ name: 'u_name', nullable: false })
  uName: string;

  @Column({ name: 'u_f_last_name', nullable: false })
  uFLastName: string;

  @Column({ name: 'u_s_last_name', nullable: true })
  uSLastName?: string;

  @Column({ name: 'u_email', unique: true, nullable: false })
  uEmail: string;

  @Column({ name: 'u_email_verified', nullable: false, default: false })
  uEmailVerified: boolean;

  @Column({ name: 'u_password', nullable: false, select: false })
  uPassword: string;

  @Column({ name: 'u_is_active', nullable: false, default: true })
  uIsActive: boolean;

  @Column({
    name: 'platform_role',
    type: 'enum',
    enum: PlatformRole,
    enumName: 'e_platform_role',
    nullable: true,
  })
  platformRole?: PlatformRole | null;

  @Column({ name: 'create_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @OneToOne(() => UserTwoFactor, twoFactor => twoFactor.user)
  twoFactor: UserTwoFactor;

  constructor(
    id: number,
    uIdentification: string,
    uName: string,
    uFLastName: string,
    uEmail: string,
    uPassword: string,
    uSLastName?: string,
    uEmailVerified: boolean = false,
    uIsActive: boolean = true,
    createAt?: Date,
    platformRole?: PlatformRole | null
  ) {
    this.id = id;
    this.uIdentification = uIdentification;
    this.uName = uName;
    this.uFLastName = uFLastName;
    this.uSLastName = uSLastName;
    this.uEmail = uEmail;
    this.uEmailVerified = uEmailVerified;
    this.uPassword = uPassword;
    this.uIsActive = uIsActive;
    this.createAt = createAt || new Date();
    this.platformRole = platformRole ?? null;
  }
}
