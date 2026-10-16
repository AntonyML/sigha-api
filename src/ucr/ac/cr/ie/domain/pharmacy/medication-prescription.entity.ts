import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import { MedicationCatalog, AdministrationRoute } from './medication-catalog.entity';
import type { MedicationAdministration } from './medication-administration.entity';

export enum PrescriptionStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    SUSPENDED = 'suspended',
    CANCELLED = 'cancelled',
}

export enum TreatmentType {
    TEMPORARY = 'temporary',
    CHRONIC = 'chronic',
    PREVENTIVE = 'preventive',
    OTHER = 'other',
}

@Entity('medication_prescriptions')
export class MedicationPrescription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_older_adult' })
    idOlderAdult: number;

    @Column({ name: 'id_medication', nullable: true })
    idMedication?: number;

    @Column({ name: 'custom_medication_name', length: 255, nullable: true })
    customMedicationName?: string;

    @Column({ length: 100 })
    dosage: string;

    @Column({
        type: 'enum',
        enum: AdministrationRoute,
        default: AdministrationRoute.ORAL,
    })
    route: AdministrationRoute;

    @Column({ name: 'frequency_hours', type: 'smallint', nullable: true })
    frequencyHours?: number;

    @Column({ name: 'specific_schedule', length: 120, nullable: true })
    specificSchedule?: string;

    @Column({
        name: 'treatment_type',
        type: 'enum',
        enum: TreatmentType,
        default: TreatmentType.CHRONIC,
    })
    treatmentType: TreatmentType;

    @Column({
        type: 'enum',
        enum: PrescriptionStatus,
        default: PrescriptionStatus.ACTIVE,
    })
    status: PrescriptionStatus;

    @Column({ name: 'start_date', type: 'date' })
    startDate: string;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate?: string;

    @Column({ type: 'text', nullable: true })
    instructions?: string;

    @Column({ name: 'prescribed_by', nullable: true })
    prescribedBy?: number;

    @Column({ name: 'is_prn', default: false })
    isPrn: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult: any;

    @ManyToOne(() => MedicationCatalog, { onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'id_medication' })
    medication?: MedicationCatalog;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'prescribed_by' })
    prescriber?: User;

    @OneToMany('MedicationAdministration', (admin: any) => admin.prescription)
    administrations?: MedicationAdministration[];
}
