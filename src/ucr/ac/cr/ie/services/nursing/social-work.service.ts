import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SocialWorkReport } from '../../domain/nursing';
import { SpecializedAppointment, SpecializedAreaName } from '../../domain/nursing';
import { User } from '../../domain/auth/core/user.entity';
import { CreateSocialWorkReportDto, UpdateSocialWorkReportDto } from '../../dto/nursing';

@Injectable()
export class SocialWorkService {
    constructor(
        @Inject('SocialWorkReportRepository')
        private readonly socialWorkRepository: Repository<SocialWorkReport>,
        @Inject('UserRepository')
        private readonly userRepository: Repository<User>,
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
    ) {}

    async createSocialWorkReport(dto: CreateSocialWorkReportDto, userId: number): Promise<{ message: string; data: SocialWorkReport }> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: dto.id_appointment },
            relations: ['area']
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.area.saName !== SpecializedAreaName.SOCIAL_WORK) {
            throw new BadRequestException('Appointment does not belong to social work');
        }

        // staff FK is not part of the social_work_reports table per migration 006
        // (it links to the appointment, not directly to a user).

        const report = this.socialWorkRepository.create({
            swDate: dto.sw_date ? new Date(dto.sw_date) : new Date(),
            swVisitType: dto.sw_visit_type,
            swFamilyRelationship: dto.sw_family_relationship,
            swEconomicAssessment: dto.sw_economic_assessment,
            swSocialSupport: dto.sw_social_support,
            swObservations: dto.sw_observations,
            swRecommendations: dto.sw_recommendations,
            idAppointment: appointment.id,
        });

        const savedReport = await this.socialWorkRepository.save(report);

        return {
            message: 'Social work report created successfully',
            data: savedReport
        };
    }

    async getSocialWorkReports(appointmentId?: number): Promise<{ message: string; data: SocialWorkReport[] }> {
        const where: any = {};
        if (appointmentId) {
            where.idAppointment = appointmentId;
        }

        const reports = await this.socialWorkRepository.find({
            where,
            relations: ['appointment'],
            order: { swDate: 'DESC' },
        });

        return {
            message: 'Social work reports retrieved successfully',
            data: reports
        };
    }

    async getSocialWorkReportById(id: number): Promise<{ message: string; data: SocialWorkReport }> {
        const report = await this.socialWorkRepository.findOne({
            where: { id },
            relations: ['appointment']
        });

        if (!report) {
            throw new NotFoundException('Social work report not found');
        }

        return {
            message: 'Social work report retrieved successfully',
            data: report
        };
    }

    async updateSocialWorkReport(id: number, dto: UpdateSocialWorkReportDto): Promise<{ message: string; data: SocialWorkReport }> {
        const report = await this.socialWorkRepository.findOne({
            where: { id },
            relations: ['appointment']
        });

        if (!report) {
            throw new NotFoundException('Social work report not found');
        }

        if (dto.sw_date !== undefined) report.swDate = new Date(dto.sw_date);
        if (dto.sw_visit_type !== undefined) report.swVisitType = dto.sw_visit_type;
        if (dto.sw_family_relationship !== undefined) report.swFamilyRelationship = dto.sw_family_relationship;
        if (dto.sw_economic_assessment !== undefined) report.swEconomicAssessment = dto.sw_economic_assessment;
        if (dto.sw_social_support !== undefined) report.swSocialSupport = dto.sw_social_support;
        if (dto.sw_observations !== undefined) report.swObservations = dto.sw_observations;
        if (dto.sw_recommendations !== undefined) report.swRecommendations = dto.sw_recommendations;
        if (dto.id_appointment !== undefined) {
            const appointment = await this.appointmentRepository.findOne({
                where: { id: dto.id_appointment },
                relations: ['area']
            });
            if (!appointment) {
                throw new NotFoundException('Appointment not found');
            }
            if (appointment.area.saName !== SpecializedAreaName.SOCIAL_WORK) {
                throw new BadRequestException('Appointment does not belong to social work');
            }
            report.idAppointment = appointment.id;
        }

        const updatedReport = await this.socialWorkRepository.save(report);

        return {
            message: 'Social work report updated successfully',
            data: updatedReport
        };
    }

    async deleteSocialWorkReport(id: number): Promise<{ message: string }> {
        const report = await this.socialWorkRepository.findOne({ where: { id } });

        if (!report) {
            throw new NotFoundException('Social work report not found');
        }

        await this.socialWorkRepository.remove(report);

        return {
            message: 'Social work report deleted successfully'
        };
    }
}
