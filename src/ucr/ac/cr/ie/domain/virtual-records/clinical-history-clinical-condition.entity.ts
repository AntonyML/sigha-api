import { Entity, PrimaryColumn } from 'typeorm';

@Entity('clinical_history_and_conditions')
export class ClinicalHistoryAndCondition {
    @PrimaryColumn({ name: 'id_c_history' })
    idCHistory: number;

    @PrimaryColumn({ name: 'id_c_condition' })
    idCCondition: number;

    constructor(
        idCHistory?: number,
        idCCondition?: number
    ) {
        this.idCHistory = idCHistory;
        this.idCCondition = idCCondition;
    }
}