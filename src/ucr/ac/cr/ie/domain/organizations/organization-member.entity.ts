import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import { Role } from '../auth/core/role.entity';
import { Organization } from './organization.entity';

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @PrimaryColumn({ name: 'organization_id', type: 'integer' })
  organizationId: number;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  /**
   * The membership's single organization role (one role per membership).
   * NOT NULL in the database; the organization role catalog excludes
   * platform-only roles.
   */
  @Column({ name: 'role_id', type: 'integer' })
  roleId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  constructor(
    userId?: number,
    organizationId?: number,
    isPrimary: boolean = false,
    roleId?: number,
  ) {
    if (userId !== undefined) this.userId = userId;
    if (organizationId !== undefined) this.organizationId = organizationId;
    this.isPrimary = isPrimary;
    if (roleId !== undefined) this.roleId = roleId;
  }
}
