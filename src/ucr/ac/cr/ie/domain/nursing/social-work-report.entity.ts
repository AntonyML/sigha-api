import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OlderAdult } from '../virtual-records/older-adult.entity';
import { User } from '../auth/core/user.entity';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum SocialWorkReportType {
    INITIAL_ASSESSMENT = 'initial assessment',
    FOLLOW_UP = 'follow up',
    CRISIS_INTERVENTION = 'crisis intervention',
    DISCHARGE_PLANNING = 'discharge planning',
    FAMILY_SUPPORT = 'family support'
}

export enum SupportLevel {
    HIGH = 'high',
    MODERATE = 'moderate',
    LOW = 'low',
    NONE = 'none'
}

export enum LivingArrangement {
    INDEPENDENT = 'independent',
    WITH_FAMILY = 'with family',
    ASSISTED_LIVING = 'assisted living',
    NURSING_HOME = 'nursing home',
    OTHER = 'other'
}

@Entity('social_work_reports')
@Index(['create_at'])
@Index(['report_date'])
@Index(['report_type'])
export class SocialWorkReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    report_date: Date;

    @Column({
        type: 'enum',
        enum: SocialWorkReportType,
        default: SocialWorkReportType.INITIAL_ASSESSMENT
    })
    report_type: SocialWorkReportType;

    @Column({ type: 'text', nullable: true })
    social_assessment: string | null;

    @Column({ type: 'text', nullable: true })
    family_dynamics: string | null;

    @Column({
        type: 'enum',
        enum: SupportLevel,
        nullable: true
    })
    family_support_level: SupportLevel | null;

    @Column({
        type: 'enum',
        enum: LivingArrangement,
        nullable: true
    })
    current_living_arrangement: LivingArrangement | null;

    @Column({ type: 'text', nullable: true })
    financial_situation: string | null;

    @Column({ type: 'text', nullable: true })
    community_resources: string | null;

    @Column({ type: 'text', nullable: true })
    social_services_needed: string | null;

    @Column({ type: 'text', nullable: true })
    recommendations: string | null;

    @Column({ type: 'text', nullable: true })
    action_plan: string | null;

    @Column({ type: 'text', nullable: true })
    follow_up_notes: string | null;

    @Column({ type: 'date', nullable: true })
    next_follow_up_date: Date | null;

    @Column({ type: 'text', nullable: true })
    referrals_made: string | null;

    @Column({ type: 'text', nullable: true })
    barriers_identified: string | null;

    @Column({ type: 'text', nullable: true })
    strengths_identified: string | null;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @UpdateDateColumn({ name: 'update_at' })
    update_at: Date;

    @ManyToOne(() => OlderAdult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: OlderAdult;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'social_worker_id' })
    social_worker: User | null;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    id_appointment: SpecializedAppointment;
}