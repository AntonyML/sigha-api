import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';

export type EncounterClass = 'ambulatory' | 'inpatient' | 'emergency' | 'home_care';
export type EncounterStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type EncounterType = 'nursing' | 'medical' | 'physiotherapy' | 'psychology' | 'social_work' | 'specialized';

@Entity({ name: 'clinical_encounters' })
export class ClinicalEncounter {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'id_professional', type: 'integer', nullable: true })
    idProfessional?: number | null;

    @Column({
        name: 'encounter_class',
        type: 'enum',
        enum: ['ambulatory', 'inpatient', 'emergency', 'home_care'],
        default: 'inpatient'
    })
    encounterClass!: EncounterClass;

    @Column({
        name: 'encounter_type',
        type: 'enum',
        enum: ['nursing', 'medical', 'physiotherapy', 'psychology', 'social_work', 'specialized'],
        default: 'nursing'
    })
    encounterType!: EncounterType;

    @Column({
        name: 'status',
        type: 'enum',
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    })
    status!: EncounterStatus;

    @Column({ name: 'start_time', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    startTime!: Date;

    @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
    endTime?: Date | null;

    @Column({ name: 'chief_complaint', type: 'text', nullable: true })
    chiefComplaint?: string | null;

    @Column({ name: 'so_subjective', type: 'text', nullable: true })
    soSubjective?: string | null;

    @Column({ name: 'so_objective', type: 'text', nullable: true })
    soObjective?: string | null;

    @Column({ name: 'so_assessment', type: 'text', nullable: true })
    soAssessment?: string | null;

    @Column({ name: 'so_plan', type: 'text', nullable: true })
    soPlan?: string | null;

    @Column({ name: 'is_signed', type: 'boolean', default: false })
    isSigned!: boolean;

    @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
    signedAt?: Date | null;

    @Column({ name: 'signed_by', type: 'integer', nullable: true })
    signedBy?: number | null;

    @Column({ name: 'id_appointment', type: 'integer', nullable: true })
    idAppointment?: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;

    @ManyToOne('User', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_professional' })
    professional?: any;

    @ManyToOne('User', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'signed_by' })
    signedByUser?: any;

    @OneToMany('ClinicalVitalSigns', 'encounter')
    vitalSigns?: any[];

    @OneToMany('ClinicalNoteAddendum', 'encounter')
    addendums?: any[];
}
