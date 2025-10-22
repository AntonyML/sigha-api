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

  @Column({ name: 'u_name' })
  uName: string;

  @Column({ name: 'u_f_last_name' })
  uFLastName: string;

  @Column({ name: 'u_s_last_name', nullable: true })
  uSLastName?: string;

  @Column({ name: 'u_email', unique: true })
  uEmail: string;

  @Column({ name: 'u_email_verified', default: false })
  uEmailVerified: boolean;

  @Column({ name: 'u_password' })
  uPassword: string;

  @Column({ name: 'u_is_active', default: true })
  uIsActive: boolean;

  @Column({ name: 'create_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

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
    roleId: number,
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