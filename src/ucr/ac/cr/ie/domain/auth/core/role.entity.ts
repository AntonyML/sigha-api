import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'r_name',
    type: 'varchar',
    length: 100,
    default: 'not specified'
  })
  rName: string;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  constructor(
    id?: number,
    rName?: string
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
