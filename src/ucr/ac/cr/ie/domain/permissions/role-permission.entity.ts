import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Role } from '../auth/core/role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'permission_id' })
  permissionId: number;

  @Column({ name: 'rp_granted', default: true })
  rpGranted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, p => p.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
