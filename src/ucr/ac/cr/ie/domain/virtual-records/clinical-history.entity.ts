import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OlderAdult } from './older-adult.entity';

export enum RcvgType {
    LESS_THAN_10 = '< 10%',
    BETWEEN_10_AND_20 = 'e /10y20%',
    BETWEEN_20_AND_30 = 'e /20y30%',
    BETWEEN_40_AND_40 = 'e /40y40%',
    MORE_THAN_40 = '> 40%',
    UNKNOWN = 'UNKNOWN'
}

@Entity('clinical_history')
export class ClinicalHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'ch_frequent_falls', default: false })
    chFrequentFalls: boolean;

    @Column({ name: 'ch_weight', type: 'decimal', precision: 5, scale: 2, nullable: true })
    chWeight?: number;

    @Column({ name: 'ch_height', type: 'decimal', precision: 4, scale: 2, nullable: true })
    chHeight?: number;

    @Column({ name: 'ch_imc', type: 'decimal', precision: 4, scale: 1, nullable: true })
    chImc?: number;

    @Column({ name: 'ch_blood_pressure', length: 7, nullable: true })
    chBloodPressure?: string;

    @Column({ name: 'ch_neoplasms', default: false })
    chNeoplasms: boolean;

    @Column({ name: 'ch_neoplasms_description', length: 300, nullable: true })
    chNeoplasmsDescription?: string;

    @Column({ name: 'ch_observations', type: 'text', nullable: true })
    chObservations?: string;

    @Column({
        name: 'ch_rcvg',
        type: 'enum',
        enum: RcvgType,
        default: RcvgType.UNKNOWN
    })
    chRcvg: RcvgType;

    @Column({ name: 'ch_vision_problems', default: false })
    chVisionProblems: boolean;

    @Column({ name: 'ch_vision_hearing', default: false })
    chVisionHearing: boolean;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_older_adult', nullable: true })
    idOlderAdult?: number;

    @ManyToOne(() => OlderAdult)
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: OlderAdult;

    constructor(
        id?: number,
        chFrequentFalls?: boolean,
        chWeight?: number,
        chHeight?: number,
        chImc?: number,
        chBloodPressure?: string,
        chNeoplasms?: boolean,
        chNeoplasmsDescription?: string,
        chObservations?: string,
        chRcvg?: RcvgType,
        chVisionProblems?: boolean,
        chVisionHearing?: boolean,
        createAt?: Date,
        idOlderAdult?: number
    ) {
        this.id = id;
        this.chFrequentFalls = chFrequentFalls || false;
        this.chWeight = chWeight;
        this.chHeight = chHeight;
        this.chImc = chImc;
        this.chBloodPressure = chBloodPressure;
        this.chNeoplasms = chNeoplasms || false;
        this.chNeoplasmsDescription = chNeoplasmsDescription;
        this.chObservations = chObservations;
        this.chRcvg = chRcvg || RcvgType.UNKNOWN;
        this.chVisionProblems = chVisionProblems || false;
        this.chVisionHearing = chVisionHearing || false;
        this.createAt = createAt || new Date();
        this.idOlderAdult = idOlderAdult;
    }
}