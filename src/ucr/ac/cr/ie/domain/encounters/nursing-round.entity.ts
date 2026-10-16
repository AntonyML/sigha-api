import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export type NursingShift = 'morning' | 'afternoon' | 'night';

@Entity({ name: 'nursing_rounds' })
export class NursingRound {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'id_staff', type: 'integer' })
    idStaff!: number;

    @Column({ name: 'round_date', type: 'date', default: () => 'CURRENT_DATE' })
    roundDate!: string;

    @Column({
        name: 'shift',
        type: 'enum',
        enum: ['morning', 'afternoon', 'night'],
        default: 'morning'
    })
    shift!: NursingShift;

    @Column({ name: 'id_vital_signs', type: 'integer', nullable: true })
    idVitalSigns?: number | null;

    @Column({ name: 'general_condition', type: 'text', nullable: true })
    generalCondition?: string | null;

    @Column({ name: 'skin_integrity', type: 'text', nullable: true })
    skinIntegrity?: string | null;

    @Column({ name: 'nutrition_hydration', type: 'text', nullable: true })
    nutritionHydration?: string | null;

    @Column({ name: 'elimination', type: 'text', nullable: true })
    elimination?: string | null;

    @Column({ name: 'mobility_comfort', type: 'text', nullable: true })
    mobilityComfort?: string | null;

    @Column({ name: 'fall_risk', type: 'varchar', length: 20, default: 'medium' })
    fallRisk!: string;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;

    @ManyToOne('User', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_staff' })
    staff?: any;

    @ManyToOne('ClinicalVitalSigns', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_vital_signs' })
    vitalSigns?: any;
}
