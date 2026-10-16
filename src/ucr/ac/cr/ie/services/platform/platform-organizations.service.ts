import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  Organization,
  OrganizationMember,
  OrganizationStatus,
  PlanTier,
  OrganizationBrandingOverrides,
} from '../../domain/organizations';
import { AuditAction } from '../../domain/audit';
import { AuditService } from '../audit/audit.service';
import { CreatePlatformOrganizationDto } from '../../controller/platform/dto/create-platform-organization.dto';
import { UpdatePlatformOrganizationDto } from '../../controller/platform/dto/update-platform-organization.dto';

/** Flat, JSON-safe projection of an organization for the platform plane. */
export interface PlatformOrganizationResponse {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: OrganizationStatus;
  planTier: PlanTier;
  isActive: boolean;
  brandingOverrides: OrganizationBrandingOverrides | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BRANDING_KEYS: (keyof OrganizationBrandingOverrides)[] = [
  'displayName',
  'logoUrl',
  'primaryColor',
];

/**
 * SaaS platform-plane organization management. Unlike `OrganizationService`
 * (which is tenant-scoped and only edits the caller's active organization), this
 * service operates across every organization and is only reachable behind
 * `PlatformGuard` (+ `PlatformStepUpGuard` for mutations).
 */
@Injectable()
export class PlatformOrganizationsService {
  constructor(
    @Inject('OrganizationRepository')
    private readonly organizationRepository: Repository<Organization>,
    @Inject('OrganizationMemberRepository')
    private readonly organizationMemberRepository: Repository<OrganizationMember>,
    private readonly auditService: AuditService,
  ) {}

  async listOrganizations(): Promise<PlatformOrganizationResponse[]> {
    const organizations = await this.organizationRepository.find({
      order: { id: 'ASC' },
    });
    const counts = await this.memberCounts();
    return organizations.map((org) =>
      this.toResponse(org, counts.get(org.id) ?? 0),
    );
  }

  async getOrganization(id: number): Promise<PlatformOrganizationResponse> {
    const org = await this.findOrFail(id);
    const memberCount = await this.organizationMemberRepository.count({
      where: { organizationId: id },
    });
    return this.toResponse(org, memberCount);
  }

  async createOrganization(
    dto: CreatePlatformOrganizationDto,
    actorId: number,
  ): Promise<PlatformOrganizationResponse> {
    const baseSlug = dto.slug ?? this.slugify(dto.name);
    const slug = await this.uniqueSlug(baseSlug, dto.slug !== undefined);

    const org = this.organizationRepository.create({
      name: dto.name,
      slug,
      logoUrl: null,
      isActive: true,
      status: OrganizationStatus.ACTIVE,
      planTier: dto.planTier ?? PlanTier.BASIC,
      brandingOverrides: null,
    });

    const saved = await this.organizationRepository.save(org);

    await this.auditService.logAction(
      actorId,
      AuditAction.CREATE,
      'organizations',
      saved.id,
      `Organización creada desde el plano de plataforma: ${saved.name} (${saved.slug})`,
    );

    return this.toResponse(saved, 0);
  }

  async updateOrganization(
    id: number,
    dto: UpdatePlatformOrganizationDto,
    actorId: number,
  ): Promise<PlatformOrganizationResponse> {
    const org = await this.findOrFail(id);

    if (dto.name !== undefined) org.name = dto.name;
    if (dto.status !== undefined) org.status = dto.status;
    if (dto.planTier !== undefined) org.planTier = dto.planTier;
    if (dto.isActive !== undefined) org.isActive = dto.isActive;
    if (dto.brandingOverrides !== undefined) {
      org.brandingOverrides = this.sanitizeBranding(dto.brandingOverrides);
    }

    const saved = await this.organizationRepository.save(org);

    await this.auditService.logAction(
      actorId,
      AuditAction.UPDATE,
      'organizations',
      saved.id,
      `Organización actualizada desde el plano de plataforma: ${saved.name} (${saved.slug})`,
    );

    const memberCount = await this.organizationMemberRepository.count({
      where: { organizationId: id },
    });

    return this.toResponse(saved, memberCount);
  }

  private async findOrFail(id: number): Promise<Organization> {
    const org = await this.organizationRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }
    return org;
  }

  private async memberCounts(): Promise<Map<number, number>> {
    const rows = await this.organizationMemberRepository
      .createQueryBuilder('member')
      .select('member.organization_id', 'orgId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('member.organization_id')
      .getRawMany<{ orgId: number | string; count: string }>();

    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(Number(row.orgId), Number(row.count));
    }
    return map;
  }

  /** URL-safe slug: lowercase, accent-free, dash-separated, max 80 chars. */
  private slugify(value: string): string {
    const slug = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return slug || 'organizacion';
  }

  /**
   * Ensures the slug is free. An explicit slug that is taken is a conflict; an
   * auto-derived slug is disambiguated with a numeric suffix.
   */
  private async uniqueSlug(base: string, explicit: boolean): Promise<string> {
    let candidate = base;
    for (let attempt = 1; attempt <= 50; attempt += 1) {
      const existing = await this.organizationRepository.findOne({
        where: { slug: candidate },
      });
      if (!existing) return candidate;
      if (explicit) {
        throw new ConflictException(`El slug '${candidate}' ya está en uso`);
      }
      candidate = `${base}-${attempt + 1}`;
    }
    throw new ConflictException('No se pudo generar un slug único');
  }

  private sanitizeBranding(
    input: Record<string, unknown>,
  ): OrganizationBrandingOverrides {
    const unknownKey = Object.keys(input).find(
      (key) => !BRANDING_KEYS.includes(key as keyof OrganizationBrandingOverrides),
    );
    if (unknownKey) {
      throw new BadRequestException(
        `brandingOverrides solo admite: ${BRANDING_KEYS.join(', ')}`,
      );
    }

    const overrides: OrganizationBrandingOverrides = {};
    for (const key of BRANDING_KEYS) {
      const value = input[key];
      if (value === undefined) continue;
      if (value !== null && typeof value !== 'string') {
        throw new BadRequestException(`brandingOverrides.${key} debe ser texto`);
      }
      overrides[key] = value as string;
    }
    return overrides;
  }

  private toResponse(
    org: Organization,
    memberCount: number,
  ): PlatformOrganizationResponse {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl ?? null,
      status: org.status,
      planTier: org.planTier,
      isActive: org.isActive,
      brandingOverrides: org.brandingOverrides ?? null,
      memberCount,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
