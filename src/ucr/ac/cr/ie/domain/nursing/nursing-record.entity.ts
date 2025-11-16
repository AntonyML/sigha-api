import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SpecializedAppointment } from './specialized-appointment.entity';

export enum Mobility {
    INDEPENDENT = 'independent',
    ASSISTED = 'assisted',
    BEDRIDDEN = 'bedridden'
}

export enum QualityLevel {
    GOOD = 'good',
    REGULAR = 'regular',
    POOR = 'poor'
}

@Entity('nursing_records')
export class NursingRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nr_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    nrDate: Date;

    @Column({ name: 'nr_temperature', type: 'decimal', precision: 4, scale: 1, nullable: true })
    nrTemperature?: number;

    @Column({ name: 'nr_blood_pressure', length: 7, nullable: true })
    nrBloodPressure?: string;

    @Column({ name: 'nr_heart_rate', type: 'smallint', unsigned: true, nullable: true })
    nrHeartRate?: number;

    @Column({ name: 'nr_pain_level', type: 'tinyint', unsigned: true, nullable: true })
    nrPainLevel?: number;

    @Column({
        name: 'nr_mobility',
        type: 'enum',
        enum: Mobility,
        default: Mobility.INDEPENDENT
    })
    nrMobility: Mobility;

    @Column({
        name: 'nr_appetite',
        type: 'enum',
        enum: QualityLevel,
        default: QualityLevel.REGULAR
    })
    nrAppetite: QualityLevel;

    @Column({
        name: 'nr_sleep_quality',
        type: 'enum',
        enum: QualityLevel,
        default: QualityLevel.REGULAR
    })
    nrSleepQuality: QualityLevel;

    @Column({ name: 'nr_notes', type: 'text', nullable: true })
    nrNotes?: string;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_appointment', nullable: true })
    idAppointment?: number;

    @ManyToOne(() => SpecializedAppointment)
    @JoinColumn({ name: 'id_appointment' })
    appointment?: SpecializedAppointment;

    constructor(
        id?: number,
        nrDate?: Date,
        nrTemperature?: number,
        nrBloodPressure?: string,
        nrHeartRate?: number,
        nrPainLevel?: number,
        nrMobility?: Mobility,
        nrAppetite?: QualityLevel,
        nrSleepQuality?: QualityLevel,
        nrNotes?: string,
        createAt?: Date,
        idAppointment?: number
    ) {
        this.id = id;
        this.nrDate = nrDate || new Date();
        this.nrTemperature = nrTemperature;
        this.nrBloodPressure = nrBloodPressure;
        this.nrHeartRate = nrHeartRate;
        this.nrPainLevel = nrPainLevel;
        this.nrMobility = nrMobility || Mobility.INDEPENDENT;
        this.nrAppetite = nrAppetite || QualityLevel.REGULAR;
        this.nrSleepQuality = nrSleepQuality || QualityLevel.REGULAR;
        this.nrNotes = nrNotes;
        this.createAt = createAt || new Date();
        this.idAppointment = idAppointment;
    }
}
