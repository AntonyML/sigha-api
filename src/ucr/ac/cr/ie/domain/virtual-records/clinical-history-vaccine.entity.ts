import { Entity, PrimaryColumn } from 'typeorm';

@Entity('vaccines_and_clinical_history')
export class VaccinesAndClinicalHistory {
    @PrimaryColumn({ name: 'id_c_history' })
    idCHistory: number;

    @PrimaryColumn({ name: 'id_vaccine' })
    idVaccine: number;

    constructor(
        idCHistory?: number,
        idVaccine?: number
    ) {
        this.idCHistory = idCHistory;
        this.idVaccine = idVaccine;
    }
}