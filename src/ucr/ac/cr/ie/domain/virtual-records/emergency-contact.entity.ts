import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OlderAdult } from './older-adult.entity';

@Entity('emergency_contacts')
export class EmergencyContact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'en_phone_number', length: 20, nullable: false })
    enPhoneNumber: string;

    @Column({ name: 'en_contact_name', length: 100, nullable: true })
    enContactName?: string;

    @Column({ name: 'create_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_older_adult', nullable: true })
    idOlderAdult?: number;

    @ManyToOne(() => OlderAdult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: OlderAdult;

    constructor(
        id?: number,
        enPhoneNumber?: string,
        enContactName?: string,
        createAt?: Date,
        idOlderAdult?: number
    ) {
        this.id = id;
        this.enPhoneNumber = enPhoneNumber;
        this.enContactName = enContactName;
        this.createAt = createAt || new Date();
        this.idOlderAdult = idOlderAdult;
    }
}