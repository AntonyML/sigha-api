import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organization, OrganizationMember } from '../../domain/organizations';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SupabaseStorageService } from '../../infrastructure/storage/supabase-storage.service';

const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @Inject('OrganizationRepository')
    private readonly organizationRepository: Repository<Organization>,
    @Inject('OrganizationMemberRepository')
    private readonly organizationMemberRepository: Repository<OrganizationMember>,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Obtiene la organización activa actualmente en la sesión del usuario.
   */
  async getCurrentOrganization(orgId: number): Promise<{
    id: number;
    name: string;
    slug: string;
    logoUrl: string | null;
  }> {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en la sesión');
    }

    const org = await this.organizationRepository.findOne({
      where: { id: orgId, isActive: true },
    });

    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl ?? null,
    };
  }

  /**
   * Actualiza el nombre u otros datos editables de la organización activa.
   */
  async updateCurrentOrganization(
    orgId: number,
    dto: UpdateOrganizationDto,
  ): Promise<{
    id: number;
    name: string;
    slug: string;
    logoUrl: string | null;
  }> {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en la sesión');
    }

    const org = await this.organizationRepository.findOne({
      where: { id: orgId, isActive: true },
    });

    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }

    if (dto.name !== undefined) {
      org.name = dto.name;
    }

    const saved = await this.organizationRepository.save(org);

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      logoUrl: saved.logoUrl ?? null,
    };
  }

  /**
   * Sube el logo de la organización activa a Supabase Storage y actualiza la entidad.
   */
  async uploadLogo(
    orgId: number,
    file: Express.Multer.File,
  ): Promise<{
    id: number;
    name: string;
    slug: string;
    logoUrl: string;
  }> {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en la sesión');
    }

    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIMETYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException('El archivo excede el tamaño máximo de 2MB');
    }

    const org = await this.organizationRepository.findOne({
      where: { id: orgId, isActive: true },
    });

    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }

    let publicUrl: string;
    try {
      publicUrl = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    } catch (err: any) {
      this.logger.error(`Error al subir logo a storage: ${err.message}`);
      throw new BadRequestException(`Fallo al almacenar el logo: ${err.message}`);
    }

    org.logoUrl = publicUrl;
    const saved = await this.organizationRepository.save(org);

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      logoUrl: publicUrl,
    };
  }
}
