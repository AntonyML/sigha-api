import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

@Entity({ name: 'clinical_vital_signs' })
export class ClinicalVitalSigns {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'id_encounter', type: 'integer', nullable: true })
    idEncounter?: number | null;

    @Column({ name: 'systolic_bp', type: 'integer', nullable: true })
    systolicBp?: number | null;

    @Column({ name: 'diastolic_bp', type: 'integer', nullable: true })
    diastolicBp?: number | null;

    @Column({ name: 'heart_rate', type: 'integer', nullable: true })
    heartRate?: number | null;

    @Column({ name: 'respiratory_rate', type: 'integer', nullable: true })
    respiratoryRate?: number | null;

    @Column({ name: 'temperature', type: 'numeric', precision: 4, scale: 1, nullable: true })
    temperature?: number | null;

    @Column({ name: 'spo2', type: 'integer', nullable: true })
    spo2?: number | null;

    @Column({ name: 'glycemia', type: 'numeric', precision: 5, scale: 1, nullable: true })
    glycemia?: number | null;

    @Column({ name: 'pain_eva', type: 'smallint', nullable: true })
    painEva?: number | null;

    @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2, nullable: true })
    weightKg?: number | null;

    @Column({ name: 'height_cm', type: 'numeric', precision: 5, scale: 2, nullable: true })
    heightCm?: number | null;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn({ name: 'recorded_at', type: 'timestamptz' })
    recordedAt!: Date;

    @Column({ name: 'recorded_by', type: 'integer', nullable: true })
    recordedBy?: number | null;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;

    @ManyToOne('ClinicalEncounter', 'vitalSigns', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_encounter' })
    encounter?: any;

    @ManyToOne('User', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'recorded_by' })
    recordedByUser?: any;
}
