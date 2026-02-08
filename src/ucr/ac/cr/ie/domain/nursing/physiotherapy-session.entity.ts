import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum PhysiotherapyType {
    EVALUATION = 'evaluation',
    THERAPY = 'therapy',
    FOLLOW_UP = 'follow_up'
}

export enum MobilityLevel {
    HIGH = 'high',
    MODERATE = 'moderate',
    LOW = 'low',
    NONE = 'none'
}

@Entity('physiotherapy_sessions')
@Index(['create_at'])
@Index(['ps_type'])
export class PhysiotherapySession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ps_date: Date;

    @Column({
        type: 'enum',
        enum: PhysiotherapyType,
        default: PhysiotherapyType.THERAPY
    })
    ps_type: PhysiotherapyType;

    @Column({
        type: 'enum',
        enum: MobilityLevel,
        default: MobilityLevel.MODERATE
    })
    ps_mobility_level: MobilityLevel;

    @Column({ type: 'tinyint', unsigned: true, nullable: true })
    ps_pain_level: number | null;

    @Column({ type: 'text', nullable: true })
    ps_treatment_description: string | null;

    @Column({ type: 'text', nullable: true })
    ps_exercise_plan: string | null;

    @Column({ type: 'text', nullable: true })
    ps_progress_notes: string | null;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @ManyToOne(() => SpecializedAppointment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_appointment' })
    id_appointment: SpecializedAppointment;
}