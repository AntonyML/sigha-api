import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('role_changes')
export class RoleChange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rc_old_role', length: 50 })
  rcOldRole: string;

  @Column({ name: 'rc_new_role', length: 50 })
  rcNewRole: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ name: 'id_user' })
  idUser: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  @Column({ name: 'changed_by' })
  changedBy: number;

  constructor(
    id?: number,
    rcOldRole?: string,
    rcNewRole?: string,
    changedAt?: Date,
    idUser?: number,
    changedBy?: number
  ) {
    this.id = id;
    this.rcOldRole = rcOldRole;
    this.rcNewRole = rcNewRole;
    this.changedAt = changedAt;
    this.idUser = idUser;
    this.changedBy = changedBy;
  }
}