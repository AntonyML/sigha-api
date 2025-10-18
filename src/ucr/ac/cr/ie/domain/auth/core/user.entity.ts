import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Role } from './role.entity';
import { UserSession } from '../sessions/user-session.entity';
import { UserTwoFactor } from '../security/user-two-factor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uIdentification: string;

  @Column()
  uName: string;

  @Column()
  uFLastName: string;

  @Column({ nullable: true })
  uSLastName?: string;

  @Column({ unique: true })
  uEmail: string;

  @Column({ default: false })
  uEmailVerified: boolean;

  @Column()
  uPassword: string;

  @Column({ default: true })
  uIsActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @Column()
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
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