import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum SocialWorkVisitType {
    HOME_VISIT = 'home visit',
    INSTITUTIONAL_VISIT = 'institutional visit',
    INTERVIEW = 'interview',
    FOLLOW_UP = 'follow_up',
}

@Entity('social_work_reports')
@Index(['createAt'])
@Index(['swDate'])
export class SocialWorkReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sw_date', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    swDate: Date;

    @Column({
        name: 'sw_visit_type',
        type: 'enum',
        enum: SocialWorkVisitType,
        nullable: false,
        default: SocialWorkVisitType.INTERVIEW,
    })
    swVisitType: SocialWorkVisitType;

    @Column({ name: 'sw_family_relationship', type: 'text', nullable: true })
    swFamilyRelationship?: string;

    @Column({ name: 'sw_economic_assessment', type: 'text', nullable: true })
    swEconomicAssessment?: string;

    @Column({ name: 'sw_social_support', type: 'text', nullable: true })
    swSocialSupport?: string;

    @Column({ name: 'sw_observations', type: 'text', nullable: true })
    swObservations?: string;

    @Column({ name: 'sw_recommendations', type: 'text', nullable: true })
    swRecommendations?: string;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_appointment', nullable: true })
    idAppointment?: number | null;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    appointment?: SpecializedAppointment;

    constructor(
        id?: number,
        swDate?: Date,
        swVisitType?: SocialWorkVisitType,
        swFamilyRelationship?: string,
        swEconomicAssessment?: string,
        swSocialSupport?: string,
        swObservations?: string,
        swRecommendations?: string,
        createAt?: Date,
        idAppointment?: number,
    ) {
        this.id = id;
        this.swDate = swDate || new Date();
        this.swVisitType = swVisitType || SocialWorkVisitType.INTERVIEW;
        this.swFamilyRelationship = swFamilyRelationship;
        this.swEconomicAssessment = swEconomicAssessment;
        this.swSocialSupport = swSocialSupport;
        this.swObservations = swObservations;
        this.swRecommendations = swRecommendations;
        this.createAt = createAt || new Date();
        this.idAppointment = idAppointment;
    }
}
