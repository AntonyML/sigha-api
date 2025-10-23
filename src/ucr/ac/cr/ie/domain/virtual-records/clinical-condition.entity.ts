import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clinical_conditions')
export class ClinicalCondition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'cc_name', length: 55 })
    ccName: string;

    constructor(id?: number, ccName?: string) {
        this.id = id;
        this.ccName = ccName;
    }
}