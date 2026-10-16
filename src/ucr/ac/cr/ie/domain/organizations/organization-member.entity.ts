import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import { Organization } from './organization.entity';

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @PrimaryColumn({ name: 'organization_id', type: 'integer' })
  organizationId: number;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  constructor(userId?: number, organizationId?: number, isPrimary: boolean = false) {
    if (userId !== undefined) this.userId = userId;
    if (organizationId !== undefined) this.organizationId = organizationId;
    this.isPrimary = isPrimary;
  }
}
