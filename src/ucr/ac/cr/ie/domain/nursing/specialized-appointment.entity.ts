import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SpecializedArea } from './specialized-area.entity';
import { OlderAdult } from '../virtual-records/older-adult.entity';
import { User } from '../auth/core/user.entity';
import { NursingRecord } from './nursing-record.entity';

export enum AppointmentType {
    CHECKUP = 'checkup',
    EVALUATION = 'evaluation',
    THERAPY = 'therapy',
    FOLLOW_UP = 'follow_up',
    EMERGENCY = 'emergency'
}

export enum AppointmentPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    RESCHEDULED = 'rescheduled'
}

@Entity('specialized_appointment')
export class SpecializedAppointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sa_appointment_date', type: 'datetime' })
    saAppointmentDate: Date;

    @Column({
        name: 'sa_appointment_type',
        type: 'enum',
        enum: AppointmentType,
        default: AppointmentType.CHECKUP
    })
    saAppointmentType: AppointmentType;

    @Column({
        name: 'sa_priority',
        type: 'enum',
        enum: AppointmentPriority,
        default: AppointmentPriority.MEDIUM
    })
    saPriority: AppointmentPriority;

    @Column({
        name: 'sa_status',
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED
    })
    saStatus: AppointmentStatus;

    @Column({ name: 'sa_notes', type: 'text', nullable: true })
    saNotes?: string;

    @Column({ name: 'sa_observations', type: 'text', nullable: true })
    saObservations?: string;

    @Column({ name: 'sa_duration_minutes', type: 'smallint', unsigned: true, nullable: true })
    saDurationMinutes?: number;

    @Column({ name: 'sa_next_appointment', type: 'datetime', nullable: true })
    saNextAppointment?: Date;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_area' })
    idArea: number;

    @Column({ name: 'id_patient' })
    idPatient: number;

    @Column({ name: 'id_staff' })
    idStaff: number;

    @ManyToOne(() => SpecializedArea)
    @JoinColumn({ name: 'id_area' })
    area: SpecializedArea;

    @ManyToOne(() => OlderAdult)
    @JoinColumn({ name: 'id_patient' })
    patient: OlderAdult;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_staff' })
    staff: User;

    @OneToMany(() => NursingRecord, nursingRecord => nursingRecord.appointment)
    nursingRecords?: NursingRecord[];

    constructor(
        id?: number,
        saAppointmentDate?: Date,
        saAppointmentType?: AppointmentType,
        saPriority?: AppointmentPriority,
        saStatus?: AppointmentStatus,
        saNotes?: string,
        saObservations?: string,
        saDurationMinutes?: number,
        saNextAppointment?: Date,
        createAt?: Date,
        idArea?: number,
        idPatient?: number,
        idStaff?: number
    ) {
        this.id = id;
        this.saAppointmentDate = saAppointmentDate;
        this.saAppointmentType = saAppointmentType || AppointmentType.CHECKUP;
        this.saPriority = saPriority || AppointmentPriority.MEDIUM;
        this.saStatus = saStatus || AppointmentStatus.SCHEDULED;
        this.saNotes = saNotes;
        this.saObservations = saObservations;
        this.saDurationMinutes = saDurationMinutes;
        this.saNextAppointment = saNextAppointment;
        this.createAt = createAt || new Date();
        this.idArea = idArea;
        this.idPatient = idPatient;
        this.idStaff = idStaff;
    }
}
