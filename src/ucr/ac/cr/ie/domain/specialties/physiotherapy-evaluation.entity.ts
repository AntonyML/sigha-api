import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export type BarthelLevel = 'total_dependence' | 'severe_dependence' | 'moderate_dependence' | 'mild_dependence' | 'independent';

@Entity({ name: 'physiotherapy_evaluations' })
export class PhysiotherapyEvaluation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'id_encounter', type: 'integer', nullable: true })
    idEncounter?: number | null;

    @Column({ name: 'evaluator_id', type: 'integer' })
    evaluatorId!: number;

    @Column({ name: 'evaluation_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    evaluationDate!: Date;

    @Column({ name: 'barthel_feeding', type: 'integer', default: 10 })
    barthelFeeding!: number;

    @Column({ name: 'barthel_bathing', type: 'integer', default: 5 })
    barthelBathing!: number;

    @Column({ name: 'barthel_grooming', type: 'integer', default: 5 })
    barthelGrooming!: number;

    @Column({ name: 'barthel_dressing', type: 'integer', default: 10 })
    barthelDressing!: number;

    @Column({ name: 'barthel_bowels', type: 'integer', default: 10 })
    barthelBowels!: number;

    @Column({ name: 'barthel_bladder', type: 'integer', default: 10 })
    barthelBladder!: number;

    @Column({ name: 'barthel_toilet_use', type: 'integer', default: 10 })
    barthelToiletUse!: number;

    @Column({ name: 'barthel_transfers', type: 'integer', default: 15 })
    barthelTransfers!: number;

    @Column({ name: 'barthel_mobility', type: 'integer', default: 15 })
    barthelMobility!: number;

    @Column({ name: 'barthel_stairs', type: 'integer', default: 10 })
    barthelStairs!: number;

    @Column({ name: 'barthel_total_score', type: 'integer' })
    barthelTotalScore!: number;

    @Column({
        name: 'dependence_level',
        type: 'enum',
        enum: ['total_dependence', 'severe_dependence', 'moderate_dependence', 'mild_dependence', 'independent']
    })
    dependenceLevel!: BarthelLevel;

    @Column({ name: 'tinetti_gait_score', type: 'integer', nullable: true })
    tinettiGaitScore?: number | null;

    @Column({ name: 'tinetti_balance_score', type: 'integer', nullable: true })
    tinettiBalanceScore?: number | null;

    @Column({ name: 'rehabilitation_goals', type: 'text', nullable: true })
    rehabilitationGoals?: string | null;

    @Column({ name: 'treatment_plan', type: 'text', nullable: true })
    treatmentPlan?: string | null;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;

    @ManyToOne('ClinicalEncounter', { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_encounter' })
    encounter?: any;

    @ManyToOne('User', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'evaluator_id' })
    evaluator?: any;
}
