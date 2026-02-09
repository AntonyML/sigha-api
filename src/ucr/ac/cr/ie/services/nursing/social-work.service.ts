import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SocialWorkReport } from '../../domain/nursing';
import { SpecializedAppointment, SpecializedAreaName } from '../../domain/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { User } from '../../domain/auth/core';
import { CreateSocialWorkReportDto, UpdateSocialWorkReportDto } from '../../dto/nursing';

@Injectable()
export class SocialWorkService {
    constructor(
        @Inject('SocialWorkReportRepository')
        private readonly socialWorkRepository: Repository<SocialWorkReport>,
        @Inject('OlderAdultRepository')
        private readonly patientRepository: Repository<OlderAdult>,
        @Inject('UserRepository')
        private readonly userRepository: Repository<User>,
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
    ) {}

    async createSocialWorkReport(dto: CreateSocialWorkReportDto, userId: number): Promise<{ message: string; data: SocialWorkReport }> {
        try {
            // Validar que el paciente existe
            const patient = await this.patientRepository.findOne({
                where: { id: dto.patient_id }
            });

            if (!patient) {
                throw new NotFoundException('Patient not found');
            }

            // Validar que la cita existe y pertenece a trabajo social
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

            // Validar que el usuario existe (opcional, ya que puede ser null)
            let socialWorker: User | null = null;
            if (userId) {
                socialWorker = await this.userRepository.findOne({
                    where: { id: userId }
                });
            }

            // Create social work report data
            const reportData: Partial<SocialWorkReport> = {
                report_date: dto.report_date ? new Date(dto.report_date) : new Date(),
                report_type: dto.report_type,
                social_assessment: dto.social_assessment,
                family_dynamics: dto.family_dynamics,
                family_support_level: dto.family_support_level,
                current_living_arrangement: dto.current_living_arrangement,
                financial_situation: dto.financial_situation,
                community_resources: dto.community_resources,
                social_services_needed: dto.social_services_needed,
                recommendations: dto.recommendations,
                action_plan: dto.action_plan,
                follow_up_notes: dto.follow_up_notes,
                next_follow_up_date: dto.next_follow_up_date ? new Date(dto.next_follow_up_date) : null,
                referrals_made: dto.referrals_made,
                barriers_identified: dto.barriers_identified,
                strengths_identified: dto.strengths_identified,
                patient: patient,
                social_worker: socialWorker,
                id_appointment: appointment
            };

            const report = this.socialWorkRepository.create(reportData);
            const savedReport = await this.socialWorkRepository.save(report);

            return {
                message: 'Social work report created successfully',
                data: savedReport
            };
        } catch (error) {
            throw error;
        }
    }

    async getSocialWorkReports(patientId?: number): Promise<{ message: string; data: SocialWorkReport[] }> {
        try {
            const query = this.socialWorkRepository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.patient', 'patient')
                .leftJoinAndSelect('report.social_worker', 'social_worker')
                .leftJoinAndSelect('report.id_appointment', 'appointment')
                .orderBy('report.report_date', 'DESC');

            if (patientId) {
                query.andWhere('patient.id = :patientId', { patientId });
            }

            const reports = await query.getMany();

            return {
                message: 'Social work reports retrieved successfully',
                data: reports
            };
        } catch (error) {
            throw error;
        }
    }

    async getSocialWorkReportById(id: number): Promise<{ message: string; data: SocialWorkReport }> {
        try {
            const report = await this.socialWorkRepository.findOne({
                where: { id },
                relations: ['patient', 'social_worker', 'id_appointment']
            });

            if (!report) {
                throw new NotFoundException('Social work report not found');
            }

            return {
                message: 'Social work report retrieved successfully',
                data: report
            };
        } catch (error) {
            throw error;
        }
    }

    async updateSocialWorkReport(id: number, dto: UpdateSocialWorkReportDto): Promise<{ message: string; data: SocialWorkReport }> {
        try {
            const report = await this.socialWorkRepository.findOne({ 
                where: { id },
                relations: ['patient', 'social_worker', 'id_appointment']
            });

            if (!report) {
                throw new NotFoundException('Social work report not found');
            }

            // Create update data
            const updateData: Partial<SocialWorkReport> = {};
            if (dto.report_date !== undefined) updateData.report_date = new Date(dto.report_date);
            if (dto.report_type !== undefined) updateData.report_type = dto.report_type;
            if (dto.social_assessment !== undefined) updateData.social_assessment = dto.social_assessment;
            if (dto.family_dynamics !== undefined) updateData.family_dynamics = dto.family_dynamics;
            if (dto.family_support_level !== undefined) updateData.family_support_level = dto.family_support_level;
            if (dto.current_living_arrangement !== undefined) updateData.current_living_arrangement = dto.current_living_arrangement;
            if (dto.financial_situation !== undefined) updateData.financial_situation = dto.financial_situation;
            if (dto.community_resources !== undefined) updateData.community_resources = dto.community_resources;
            if (dto.social_services_needed !== undefined) updateData.social_services_needed = dto.social_services_needed;
            if (dto.recommendations !== undefined) updateData.recommendations = dto.recommendations;
            if (dto.action_plan !== undefined) updateData.action_plan = dto.action_plan;
            if (dto.follow_up_notes !== undefined) updateData.follow_up_notes = dto.follow_up_notes;
            if (dto.next_follow_up_date !== undefined) updateData.next_follow_up_date = dto.next_follow_up_date ? new Date(dto.next_follow_up_date) : null;
            if (dto.referrals_made !== undefined) updateData.referrals_made = dto.referrals_made;
            if (dto.barriers_identified !== undefined) updateData.barriers_identified = dto.barriers_identified;
            if (dto.id_appointment !== undefined) {
                // Validar que la cita existe y pertenece a trabajo social
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

                updateData.id_appointment = appointment;
            }

            await this.socialWorkRepository.update(id, updateData);
            const updatedReport = await this.socialWorkRepository.findOne({
                where: { id },
                relations: ['patient', 'social_worker', 'id_appointment']
            });

            return {
                message: 'Social work report updated successfully',
                data: updatedReport
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteSocialWorkReport(id: number): Promise<{ message: string }> {
        try {
            const report = await this.socialWorkRepository.findOne({ where: { id } });

            if (!report) {
                throw new NotFoundException('Social work report not found');
            }

            await this.socialWorkRepository.delete(id);

            return {
                message: 'Social work report deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}