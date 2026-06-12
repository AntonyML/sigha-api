import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum PhysiotherapyType {
    EVALUATION = 'evaluation',
    THERAPY = 'therapy',
    FOLLOW_UP = 'follow_up',
}

export enum MobilityLevel {
    HIGH = 'high',
    MODERATE = 'moderate',
    LOW = 'low',
    NONE = 'none',
}

@Entity('physiotherapy_sessions')
@Index(['createAt'])
@Index(['psType'])
export class PhysiotherapySession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'ps_date', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    psDate: Date;

    @Column({
        name: 'ps_type',
        type: 'enum',
        enum: PhysiotherapyType,
        nullable: false,
        default: PhysiotherapyType.THERAPY,
    })
    psType: PhysiotherapyType;

    @Column({
        name: 'ps_mobility_level',
        type: 'enum',
        enum: MobilityLevel,
        nullable: false,
        default: MobilityLevel.MODERATE,
    })
    psMobilityLevel: MobilityLevel;

    @Column({ name: 'ps_pain_level', type: 'smallint', nullable: true })
    psPainLevel?: number;

    @Column({ name: 'ps_treatment_description', type: 'text', nullable: true })
    psTreatmentDescription?: string;

    @Column({ name: 'ps_exercise_plan', type: 'text', nullable: true })
    psExercisePlan?: string;

    @Column({ name: 'ps_progress_notes', type: 'text', nullable: true })
    psProgressNotes?: string;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_appointment', nullable: false })
    idAppointment: number;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    appointment: SpecializedAppointment;

    constructor(
        id?: number,
        psDate?: Date,
        psType?: PhysiotherapyType,
        psMobilityLevel?: MobilityLevel,
        psPainLevel?: number,
        psTreatmentDescription?: string,
        psExercisePlan?: string,
        psProgressNotes?: string,
        createAt?: Date,
        idAppointment?: number,
    ) {
        this.id = id;
        this.psDate = psDate || new Date();
        this.psType = psType || PhysiotherapyType.THERAPY;
        this.psMobilityLevel = psMobilityLevel || MobilityLevel.MODERATE;
        this.psPainLevel = psPainLevel;
        this.psTreatmentDescription = psTreatmentDescription;
        this.psExercisePlan = psExercisePlan;
        this.psProgressNotes = psProgressNotes;
        this.createAt = createAt || new Date();
        this.idAppointment = idAppointment;
    }
}
