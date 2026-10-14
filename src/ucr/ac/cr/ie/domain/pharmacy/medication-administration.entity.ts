import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import type { MedicationPrescription } from './medication-prescription.entity';

export enum AdministrationStatus {
    SCHEDULED = 'scheduled',
    ADMINISTERED = 'administered',
    OMITTED = 'omitted',
    REFUSED = 'refused',
}

@Entity('medication_administrations')
export class MedicationAdministration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_prescription' })
    idPrescription: number;

    @Column({ name: 'id_older_adult' })
    idOlderAdult: number;

    @Column({ name: 'scheduled_time', type: 'timestamptz' })
    scheduledTime: Date;

    @Column({ name: 'administered_time', type: 'timestamptz', nullable: true })
    administeredTime?: Date;

    @Column({
        type: 'enum',
        enum: AdministrationStatus,
        default: AdministrationStatus.SCHEDULED,
    })
    status: AdministrationStatus;

    @Column({ name: 'dose_given', length: 100, nullable: true })
    doseGiven?: string;

    @Column({ name: 'administered_by', nullable: true })
    administeredBy?: number;

    @Column({ name: 'omission_reason', type: 'text', nullable: true })
    omissionReason?: string;

    @Column({ type: 'text', nullable: true })
    observations?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne('MedicationPrescription', (presc: any) => presc.administrations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_prescription' })
    prescription?: MedicationPrescription;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult: any;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'administered_by' })
    administrator?: User;
}
