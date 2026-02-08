import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OlderAdult } from '../virtual-records/older-adult.entity';
import { User } from '../auth/core/user.entity';

export enum RecordType {
    INITIAL_CONSULTATION = 'initial consultation',
    FOLLOW_UP = 'follow up',
    EMERGENCY = 'emergency',
    ROUTINE_CHECK = 'routine check',
    SPECIALIST_REFERRAL = 'specialist referral'
}

export enum VitalSignsStatus {
    NORMAL = 'normal',
    ABNORMAL = 'abnormal',
    CRITICAL = 'critical'
}

@Entity('medical_records')
@Index(['create_at'])
@Index(['record_date'])
@Index(['record_type'])
export class MedicalRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    record_date: Date;

    @Column({
        type: 'enum',
        enum: RecordType,
        default: RecordType.ROUTINE_CHECK
    })
    record_type: RecordType;

    @Column({ type: 'text', nullable: true })
    chief_complaint: string | null;

    @Column({ type: 'text', nullable: true })
    medical_history: string | null;

    @Column({ type: 'text', nullable: true })
    current_medications: string | null;

    @Column({ type: 'text', nullable: true })
    allergies: string | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    temperature: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    blood_pressure_systolic: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    blood_pressure_diastolic: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    heart_rate: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    respiratory_rate: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight_kg: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    height_cm: number | null;

    @Column({
        type: 'enum',
        enum: VitalSignsStatus,
        nullable: true
    })
    vital_signs_status: VitalSignsStatus | null;

    @Column({ type: 'text', nullable: true })
    physical_examination: string | null;

    @Column({ type: 'text', nullable: true })
    diagnosis: string | null;

    @Column({ type: 'text', nullable: true })
    treatment_plan: string | null;

    @Column({ type: 'text', nullable: true })
    prescribed_medications: string | null;

    @Column({ type: 'text', nullable: true })
    laboratory_tests: string | null;

    @Column({ type: 'text', nullable: true })
    imaging_studies: string | null;

    @Column({ type: 'text', nullable: true })
    follow_up_instructions: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @UpdateDateColumn({ name: 'update_at' })
    update_at: Date;

    @ManyToOne(() => OlderAdult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: OlderAdult;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by' })
    created_by: User | null;
}