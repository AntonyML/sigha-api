import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Tenant lifecycle status (mirrors the e_organization_status enum). */
export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

/** Commercial plan tier (mirrors the e_plan_tier enum). */
export enum PlanTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

/** Per-organization branding overrides (all fields optional). */
export interface OrganizationBrandingOverrides {
  displayName?: string;
  logoUrl?: string;
  primaryColor?: string;
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  slug: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    enumName: 'e_organization_status',
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  @Column({
    name: 'plan_tier',
    type: 'enum',
    enum: PlanTier,
    enumName: 'e_plan_tier',
    default: PlanTier.BASIC,
  })
  planTier: PlanTier;

  @Column({ name: 'branding_overrides', type: 'jsonb', nullable: true })
  brandingOverrides?: OrganizationBrandingOverrides | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  constructor(
    id?: number,
    name?: string,
    slug?: string,
    logoUrl?: string,
    isActive: boolean = true,
  ) {
    if (id !== undefined) this.id = id;
    if (name !== undefined) this.name = name;
    if (slug !== undefined) this.slug = slug;
    if (logoUrl !== undefined) this.logoUrl = logoUrl;
    this.isActive = isActive;
    this.status = OrganizationStatus.ACTIVE;
    this.planTier = PlanTier.BASIC;
    this.brandingOverrides = null;
  }
}
