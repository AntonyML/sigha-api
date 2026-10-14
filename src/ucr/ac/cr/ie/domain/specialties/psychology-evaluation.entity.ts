import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export type GdsLevel = 'normal' | 'mild_depression' | 'moderate_depression' | 'severe_depression';
export type PfeifferLevel = 'intact' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';

@Entity({ name: 'psychology_evaluations' })
export class PsychologyEvaluation {
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

    @Column({ name: 'yesavage_gds_score', type: 'integer', nullable: true })
    yesavageGdsScore?: number | null;

    @Column({
        name: 'depression_severity',
        type: 'enum',
        enum: ['normal', 'mild_depression', 'moderate_depression', 'severe_depression'],
        nullable: true
    })
    depressionSeverity?: GdsLevel | null;

    @Column({ name: 'pfeiffer_errors_score', type: 'integer', nullable: true })
    pfeifferErrorsScore?: number | null;

    @Column({
        name: 'cognitive_impairment',
        type: 'enum',
        enum: ['intact', 'mild_impairment', 'moderate_impairment', 'severe_impairment'],
        nullable: true
    })
    cognitiveImpairment?: PfeifferLevel | null;

    @Column({ name: 'emotional_state', type: 'text', nullable: true })
    emotionalState?: string | null;

    @Column({ name: 'behavioral_observations', type: 'text', nullable: true })
    behavioralObservations?: string | null;

    @Column({ name: 'intervention_plan', type: 'text', nullable: true })
    interventionPlan?: string | null;

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
