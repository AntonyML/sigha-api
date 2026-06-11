import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Role } from './role.entity';
import { UserSession } from '../sessions/user-session.entity';
import { UserTwoFactor } from '../security/user-two-factor.entity';

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

  @Column({ name: 'u_password', nullable: false })
  uPassword: string;

  @Column({ name: 'u_is_active', nullable: false, default: true })
  uIsActive: boolean;

  @Column({ name: 'create_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @Column({ name: 'role_id', nullable: true })
  roleId: number | null;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role | null;

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
    roleId: number | null,
    uSLastName?: string,
    uEmailVerified: boolean = false,
    uIsActive: boolean = true,
    createAt?: Date
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
    this.roleId = roleId;
  }
}