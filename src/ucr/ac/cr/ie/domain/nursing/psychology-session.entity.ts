import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum PsychologySessionType {
    EVALUATION = 'evaluation',
    THERAPY = 'therapy',
    FOLLOW_UP = 'follow_up',
    GROUP_THERAPY = 'group therapy'
}

export enum Mood {
    STABLE = 'stable',
    ANXIOUS = 'anxious',
    DEPRESSED = 'depressed',
    IRRITABLE = 'irritable',
    OTHER = 'other'
}

export enum CognitiveStatus {
    NORMAL = 'normal',
    MILD_IMPAIRMENT = 'mild impairment',
    MODERATE_IMPAIRMENT = 'moderate impairment',
    SEVERE_IMPAIRMENT = 'severe impairment'
}

@Entity('psychology_sessions')
@Index(['create_at'])
@Index(['psy_session_type'])
export class PsychologySession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    psy_date: Date;

    @Column({
        type: 'enum',
        enum: PsychologySessionType,
        default: PsychologySessionType.EVALUATION
    })
    psy_session_type: PsychologySessionType;

    @Column({
        type: 'enum',
        enum: Mood,
        default: Mood.STABLE
    })
    psy_mood: Mood;

    @Column({
        type: 'enum',
        enum: CognitiveStatus,
        default: CognitiveStatus.NORMAL
    })
    psy_cognitive_status: CognitiveStatus;

    @Column({ type: 'text', nullable: true })
    psy_observations: string | null;

    @Column({ type: 'text', nullable: true })
    psy_therapy_goal: string | null;

    @Column({ type: 'text', nullable: true })
    psy_progress: string | null;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    id_appointment: SpecializedAppointment;
}