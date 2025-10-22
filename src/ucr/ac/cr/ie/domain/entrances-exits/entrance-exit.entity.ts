import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum EntranceExitType {
    EMPLOYEE = 'employee',
    OLDER_ADULT = 'older adult',
    VISITOR = 'visitor',
    VOLUNTEER = 'volunteer',
    VEHICLE = 'vehicle',
    OTHER = 'other'
}

export enum AccessType {
    ENTRANCE = 'entrance',
    EXIT = 'exit'
}

@Entity('entrances_exits')
export class EntranceExit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'ee_type',
        type: 'enum',
        enum: EntranceExitType,
        default: EntranceExitType.OTHER
    })
    eeType: EntranceExitType;

    @Column({
        name: 'ee_access_type',
        type: 'enum',
        enum: AccessType
    })
    eeAccessType: AccessType;

    @Column({ name: 'ee_identification', length: 20, nullable: true })
    eeIdentification?: string;

    @Column({ name: 'ee_name', length: 50, nullable: true })
    eeName?: string;

    @Column({ name: 'ee_f_last_name', length: 50, nullable: true })
    eeFLastName?: string;

    @Column({ name: 'ee_s_last_name', length: 50, nullable: true })
    eeSLastName?: string;

    @Column({ name: 'ee_datetime_entrance', type: 'datetime', nullable: true })
    eeDatetimeEntrance?: Date;

    @Column({ name: 'ee_datetime_exit', type: 'datetime', nullable: true })
    eeDatetimeExit?: Date;

    @Column({ name: 'ee_close', default: false })
    eeClose: boolean;

    @Column({ name: 'ee_observations', type: 'text', nullable: true })
    eeObservations?: string;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    constructor(
        id: number,
        eeType: EntranceExitType,
        eeAccessType: AccessType,
        eeClose: boolean = false,
        eeIdentification?: string,
        eeName?: string,
        eeFLastName?: string,
        eeSLastName?: string,
        eeDatetimeEntrance?: Date,
        eeDatetimeExit?: Date,
        eeObservations?: string,
        createAt?: Date
    ) {
        this.id = id;
        this.eeType = eeType;
        this.eeAccessType = eeAccessType;
        this.eeClose = eeClose;
        this.eeIdentification = eeIdentification;
        this.eeName = eeName;
        this.eeFLastName = eeFLastName;
        this.eeSLastName = eeSLastName;
        this.eeDatetimeEntrance = eeDatetimeEntrance;
        this.eeDatetimeExit = eeDatetimeExit;
        this.eeObservations = eeObservations;
        this.createAt = createAt || new Date();
    }
}