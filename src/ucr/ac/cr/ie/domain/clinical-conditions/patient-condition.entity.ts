import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Icd10Catalog } from './icd10-catalog.entity';

export enum ConditionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    RESOLVED = 'resolved',
    REMISSION = 'remission',
}

export enum ConditionSeverity {
    MILD = 'mild',
    MODERATE = 'moderate',
    SEVERE = 'severe',
}

@Entity('patient_conditions')
export class PatientCondition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_older_adult' })
    idOlderAdult: number;

    @Column({ name: 'id_icd10', nullable: true })
    idIcd10?: number;

    @Column({ name: 'custom_diagnosis_name', length: 255, nullable: true })
    customDiagnosisName?: string;

    @Column({
        type: 'enum',
        enum: ConditionStatus,
        default: ConditionStatus.ACTIVE,
    })
    status: ConditionStatus;

    @Column({
        type: 'enum',
        enum: ConditionSeverity,
        default: ConditionSeverity.MODERATE,
    })
    severity: ConditionSeverity;

    @Column({ name: 'onset_date', type: 'date', nullable: true })
    onsetDate?: string;

    @Column({ name: 'resolved_date', type: 'date', nullable: true })
    resolvedDate?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult: any;

    @ManyToOne(() => Icd10Catalog, { onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'id_icd10' })
    icd10?: Icd10Catalog;
}
