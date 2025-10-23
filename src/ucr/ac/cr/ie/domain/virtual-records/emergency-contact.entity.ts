import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OlderAdult } from './older-adult.entity';

@Entity('emergency_contacts')
export class EmergencyContact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'en_phone_number', length: 20 })
    enPhoneNumber: string;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_older_adult', nullable: true })
    idOlderAdult?: number;

    @ManyToOne(() => OlderAdult)
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: OlderAdult;

    constructor(
        id?: number,
        enPhoneNumber?: string,
        createAt?: Date,
        idOlderAdult?: number
    ) {
        this.id = id;
        this.enPhoneNumber = enPhoneNumber;
        this.createAt = createAt || new Date();
        this.idOlderAdult = idOlderAdult;
    }
}