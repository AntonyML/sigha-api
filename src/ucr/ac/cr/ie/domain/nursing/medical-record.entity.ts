import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OlderAdult } from '../virtual-records/older-adult.entity';
import { User } from '../auth/core/user.entity';
import { SpecializedAppointment } from './specialized-appointment.entity';

@Entity('medical_record')
@Index(['create_at'])
@Index(['mr_record_date'])
@Index(['id_older_adult'])
export class MedicalRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'mr_record_date', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    mrRecordDate: Date;

    @Column({ name: 'mr_summary', type: 'text', nullable: false })
    mrSummary: string;

    @Column({ name: 'mr_diagnosis', type: 'text', nullable: true })
    mrDiagnosis?: string;

    @Column({ name: 'mr_treatment', type: 'text', nullable: true })
    mrTreatment?: string;

    @Column({ name: 'mr_observations', type: 'text', nullable: true })
    mrObservations?: string;

    @Column({ name: 'mr_origin_area', length: 60, nullable: false })
    mrOriginArea: string;

    @Column({ name: 'mr_signed_by', length: 150, nullable: true })
    mrSignedBy?: string;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_older_adult', nullable: false })
    idOlderAdult: number;

    @Column({ name: 'id_appointment', nullable: true })
    idAppointment?: number | null;

    @Column({ name: 'id_staff', nullable: true })
    idStaff?: number | null;

    @ManyToOne(() => OlderAdult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult: OlderAdult;

    @ManyToOne(() => SpecializedAppointment)
    @JoinColumn({ name: 'id_appointment' })
    appointment?: SpecializedAppointment | null;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_staff' })
    staff?: User | null;

    constructor(
        id?: number,
        mrRecordDate?: Date,
        mrSummary?: string,
        mrDiagnosis?: string,
        mrTreatment?: string,
        mrObservations?: string,
        mrOriginArea?: string,
        mrSignedBy?: string,
        createAt?: Date,
        idOlderAdult?: number,
        idAppointment?: number | null,
        idStaff?: number | null,
    ) {
        this.id = id;
        this.mrRecordDate = mrRecordDate || new Date();
        this.mrSummary = mrSummary;
        this.mrDiagnosis = mrDiagnosis;
        this.mrTreatment = mrTreatment;
        this.mrObservations = mrObservations;
        this.mrOriginArea = mrOriginArea;
        this.mrSignedBy = mrSignedBy;
        this.createAt = createAt || new Date();
        this.idOlderAdult = idOlderAdult;
        this.idAppointment = idAppointment ?? null;
        this.idStaff = idStaff ?? null;
    }
}
