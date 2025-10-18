import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  rName: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  constructor(
    id: number,
    rName: string
  ) {
    this.id = id;
    this.rName = rName;
  }
}

export enum RoleType {
  SUPER_ADMIN = 'super admin',
  ADMIN = 'admin',
  DIRECTOR = 'director',
  NURSE = 'nurse',
  PHYSIOTHERAPIST = 'physiotherapist',
  PSYCHOLOGIST = 'psychologist',
  SOCIAL_WORKER = 'social worker',
  NOT_SPECIFIED = 'not specified'
}