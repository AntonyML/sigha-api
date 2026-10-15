import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

export type ClinicalScaleType = 'BARTHEL' | 'YESAVAGE' | 'PFEIFFER' | 'APGAR_FAMILIAR' | 'EVA' | 'GLASGOW';

@Entity({ name: 'clinical_scale_evaluations' })
export class ClinicalScaleEvaluation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'encounter_id', type: 'integer', nullable: true })
    encounterId?: number | null;

    @Column({ name: 'nursing_round_id', type: 'integer', nullable: true })
    nursingRoundId?: number | null;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'scale_type', type: 'varchar', length: 32 })
    scaleType!: ClinicalScaleType;

    @Column({ name: 'total_score', type: 'numeric', precision: 7, scale: 2 })
    totalScore!: number;

    @Column({ type: 'varchar', length: 200 })
    interpretation!: string;

    @Column({ name: 'responses_payload', type: 'jsonb' })
    responsesPayload!: Record<string, unknown>;

    @Column({ name: 'evaluated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    evaluatedAt!: Date;

    @Column({ name: 'evaluated_by', type: 'integer', nullable: true })
    evaluatedBy?: number | null;

    @ManyToOne('ClinicalEncounter', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'encounter_id' })
    encounter?: any;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;
}
