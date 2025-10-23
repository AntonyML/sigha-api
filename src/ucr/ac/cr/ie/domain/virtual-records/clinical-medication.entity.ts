import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClinicalHistory } from './clinical-history.entity';

export enum TreatmentType {
    TEMPORARY = 'temporary',
    CHRONIC = 'chronic',
    PREVENTIVE = 'preventive',
    OTHER = 'other'
}

@Entity('clinical_medication')
export class ClinicalMedication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'm_medication', length: 500 })
    mMedication: string;

    @Column({ name: 'm_dosage', length: 200 })
    mDosage: string;

    @Column({
        name: 'm_treatment_type',
        type: 'enum',
        enum: TreatmentType,
        default: TreatmentType.OTHER
    })
    mTreatmentType: TreatmentType;

    @Column({ name: 'id_clinical_history', nullable: true })
    idClinicalHistory?: number;

    @ManyToOne(() => ClinicalHistory)
    @JoinColumn({ name: 'id_clinical_history' })
    clinicalHistory?: ClinicalHistory;

    constructor(
        id?: number,
        mMedication?: string,
        mDosage?: string,
        mTreatmentType?: TreatmentType,
        idClinicalHistory?: number
    ) {
        this.id = id;
        this.mMedication = mMedication;
        this.mDosage = mDosage;
        this.mTreatmentType = mTreatmentType || TreatmentType.OTHER;
        this.idClinicalHistory = idClinicalHistory;
    }
}