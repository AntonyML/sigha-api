import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';

export enum VaccineDose {
    FIRST = '1st',
    SECOND = '2nd',
    THIRD = '3rd',
    BOOSTER = 'booster',
    ANNUAL = 'annual',
    SINGLE = 'single',
}

@Entity('patient_vaccinations')
export class PatientVaccination {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_older_adult' })
    idOlderAdult: number;

    @Column({ name: 'id_vaccine', nullable: true })
    idVaccine?: number;

    @Column({ name: 'custom_vaccine_name', length: 150, nullable: true })
    customVaccineName?: string;

    @Column({
        type: 'enum',
        enum: VaccineDose,
        default: VaccineDose.SINGLE,
    })
    dose: VaccineDose;

    @Column({ name: 'application_date', type: 'date' })
    applicationDate: string;

    @Column({ name: 'lot_number', length: 60, nullable: true })
    lotNumber?: string;

    @Column({ name: 'expiration_date', type: 'date', nullable: true })
    expirationDate?: string;

    @Column({ name: 'applied_by', length: 150, nullable: true })
    appliedBy?: string;

    @Column({ name: 'adverse_reactions', type: 'text', nullable: true })
    adverseReactions?: string;

    @Column({ name: 'next_booster_date', type: 'date', nullable: true })
    nextBoosterDate?: string;

    @Column({ type: 'text', nullable: true })
    observations?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult: any;

    @ManyToOne('Vaccine', { onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'id_vaccine' })
    vaccine?: any;
}
