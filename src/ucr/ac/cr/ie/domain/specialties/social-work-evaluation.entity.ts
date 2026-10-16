import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export type ApgarLevel = 'highly_functional' | 'mild_dysfunction' | 'severe_dysfunction';

@Entity({ name: 'social_work_evaluations' })
export class SocialWorkEvaluation {
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

    @Column({ name: 'apgar_adaptation', type: 'integer', default: 2 })
    apgarAdaptation!: number;

    @Column({ name: 'apgar_partnership', type: 'integer', default: 2 })
    apgarPartnership!: number;

    @Column({ name: 'apgar_growth', type: 'integer', default: 2 })
    apgarGrowth!: number;

    @Column({ name: 'apgar_affection', type: 'integer', default: 2 })
    apgarAffection!: number;

    @Column({ name: 'apgar_resolve', type: 'integer', default: 2 })
    apgarResolve!: number;

    @Column({ name: 'apgar_total_score', type: 'integer' })
    apgarTotalScore!: number;

    @Column({
        name: 'family_functioning',
        type: 'enum',
        enum: ['highly_functional', 'mild_dysfunction', 'severe_dysfunction']
    })
    familyFunctioning!: ApgarLevel;

    @Column({ name: 'family_support_network', type: 'text', nullable: true })
    familySupportNetwork?: string | null;

    @Column({ name: 'socioeconomic_assessment', type: 'text', nullable: true })
    socioeconomicAssessment?: string | null;

    @Column({ name: 'institutional_recommendations', type: 'text', nullable: true })
    institutionalRecommendations?: string | null;

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
