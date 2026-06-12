import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum PsychologySessionType {
    EVALUATION = 'evaluation',
    THERAPY = 'therapy',
    FOLLOW_UP = 'follow_up',
    GROUP_THERAPY = 'group therapy',
}

export enum Mood {
    STABLE = 'stable',
    ANXIOUS = 'anxious',
    DEPRESSED = 'depressed',
    IRRITABLE = 'irritable',
    OTHER = 'other',
}

export enum CognitiveStatus {
    NORMAL = 'normal',
    MILD_IMPAIRMENT = 'mild impairment',
    MODERATE_IMPAIRMENT = 'moderate impairment',
    SEVERE_IMPAIRMENT = 'severe impairment',
}

@Entity('psychology_sessions')
@Index(['createAt'])
@Index(['psySessionType'])
export class PsychologySession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'psy_date', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    psyDate: Date;

    @Column({
        name: 'psy_session_type',
        type: 'enum',
        enum: PsychologySessionType,
        nullable: false,
        default: PsychologySessionType.EVALUATION,
    })
    psySessionType: PsychologySessionType;

    @Column({
        name: 'psy_mood',
        type: 'enum',
        enum: Mood,
        nullable: false,
        default: Mood.STABLE,
    })
    psyMood: Mood;

    @Column({
        name: 'psy_cognitive_status',
        type: 'enum',
        enum: CognitiveStatus,
        nullable: false,
        default: CognitiveStatus.NORMAL,
    })
    psyCognitiveStatus: CognitiveStatus;

    @Column({ name: 'psy_observations', type: 'text', nullable: true })
    psyObservations?: string;

    @Column({ name: 'psy_therapy_goal', type: 'text', nullable: true })
    psyTherapyGoal?: string;

    @Column({ name: 'psy_progress', type: 'text', nullable: true })
    psyProgress?: string;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_appointment', nullable: true })
    idAppointment?: number | null;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    appointment?: SpecializedAppointment;

    constructor(
        id?: number,
        psyDate?: Date,
        psySessionType?: PsychologySessionType,
        psyMood?: Mood,
        psyCognitiveStatus?: CognitiveStatus,
        psyObservations?: string,
        psyTherapyGoal?: string,
        psyProgress?: string,
        createAt?: Date,
        idAppointment?: number,
    ) {
        this.id = id;
        this.psyDate = psyDate || new Date();
        this.psySessionType = psySessionType || PsychologySessionType.EVALUATION;
        this.psyMood = psyMood || Mood.STABLE;
        this.psyCognitiveStatus = psyCognitiveStatus || CognitiveStatus.NORMAL;
        this.psyObservations = psyObservations;
        this.psyTherapyGoal = psyTherapyGoal;
        this.psyProgress = psyProgress;
        this.createAt = createAt || new Date();
        this.idAppointment = idAppointment;
    }
}
