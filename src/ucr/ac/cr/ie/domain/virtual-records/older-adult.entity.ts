import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { OlderAdultFamily } from './older-adult-family.entity';

export enum MaritalStatus {
    SINGLE = 'single',
    MARRIED = 'married',
    DIVORCED = 'divorced',
    WIDOWED = 'widowed',
    COMMON_LAW_UNION = 'common law union',
    SEPARATED = 'separated',
    NOT_SPECIFIED = 'not specified'
}

export enum YearsSchooling {
    NO_SCHOOLING = 'no schooling',
    INCOMPLETE_PRIMARY = 'incomplete primary',
    COMPLETE_PRIMARY = 'complete primary',
    INCOMPLETE_SECONDARY = 'incomplete secondary',
    COMPLETE_SECONDARY = 'complete secondary',
    TECHNICAL_DEGREE = 'technical degree',
    INCOMPLETE_UNIVERSITY = 'incomplete university',
    COMPLETE_UNIVERSITY = 'complete university',
    POSTGRADUATE = 'postgraduate',
    NOT_SPECIFIED = 'not specified'
}

export enum OlderAdultStatus {
    ALIVE = 'alive',
    DEAD = 'dead'
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NOT_SPECIFIED = 'not specified'
}

export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    UNKNOWN = 'UNKNOWN'
}

@Entity('older_adult')
export class OlderAdult {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'oa_identification', length: 20, unique: true })
    oaIdentification: string;

    @Column({ name: 'oa_name', length: 50 })
    oaName: string;

    @Column({ name: 'oa_f_last_name', length: 50 })
    oaFLastName: string;

    @Column({ name: 'oa_s_last_name', length: 50, nullable: true })
    oaSLastName?: string;

    @Column({ name: 'oa_birthdate', type: 'date', nullable: true })
    oaBirthdate?: Date;

    @Column({
        name: 'oa_marital_status',
        type: 'enum',
        enum: MaritalStatus,
        default: MaritalStatus.NOT_SPECIFIED
    })
    oaMaritalStatus: MaritalStatus;

    @Column({ name: 'oa_dwelling', type: 'text', nullable: true })
    oaDwelling?: string;

    @Column({
        name: 'oa_years_schooling',
        type: 'enum',
        enum: YearsSchooling,
        default: YearsSchooling.NOT_SPECIFIED
    })
    oaYearsSchooling: YearsSchooling;

    @Column({ name: 'oa_previous_work', length: 300 })
    oaPreviousWork: string;

    @Column({ name: 'oa_is_retired', default: false })
    oaIsRetired: boolean;

    @Column({ name: 'oa_has_pension', default: false })
    oaHasPension: boolean;

    @Column({ name: 'oa_other', default: false })
    oaOther: boolean;

    @Column({ name: 'oa_other_description', length: 300, nullable: true })
    oaOtherDescription?: string;

    @Column({ name: 'oa_area_of_origin', length: 300, nullable: true })
    oaAreaOfOrigin?: string;

    @Column({ name: 'oa_children_count', type: 'tinyint', unsigned: true, default: 0 })
    oaChildrenCount: number;

    @Column({
        name: 'oa_status',
        type: 'enum',
        enum: OlderAdultStatus,
        default: OlderAdultStatus.ALIVE
    })
    oaStatus: OlderAdultStatus;

    @Column({ name: 'oa_death_date', type: 'date', nullable: true })
    oaDeathDate?: Date;

    @Column({ name: 'oa_economic_income', type: 'decimal', precision: 10, scale: 2, nullable: true })
    oaEconomicIncome?: number;

    @Column({ name: 'oa_phone_numner', length: 20, nullable: true })
    oaPhoneNumber?: string;

    @Column({ name: 'oa_email', length: 256, nullable: true })
    oaEmail?: string;

    @Column({ name: 'oa_profile_photo_url', length: 255, nullable: true })
    oaProfilePhotoUrl?: string;

    @Column({
        name: 'oa_gender',
        type: 'enum',
        enum: Gender,
        default: Gender.NOT_SPECIFIED
    })
    oaGender: Gender;

    @Column({
        name: 'oa_blood_type',
        type: 'enum',
        enum: BloodType,
        default: BloodType.UNKNOWN
    })
    oaBloodType: BloodType;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_program', nullable: true })
    idProgram?: number;

    @Column({ name: 'id_family', nullable: true })
    idFamily?: number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'id_program' })
    program?: Program;

    @ManyToOne(() => OlderAdultFamily)
    @JoinColumn({ name: 'id_family' })
    family?: OlderAdultFamily;

    constructor(
        id?: number,
        oaIdentification?: string,
        oaName?: string,
        oaFLastName?: string,
        oaPreviousWork?: string,
        oaSLastName?: string,
        oaBirthdate?: Date,
        oaMaritalStatus?: MaritalStatus,
        oaDwelling?: string,
        oaYearsSchooling?: YearsSchooling,
        oaIsRetired?: boolean,
        oaHasPension?: boolean,
        oaOther?: boolean,
        oaOtherDescription?: string,
        oaAreaOfOrigin?: string,
        oaChildrenCount?: number,
        oaStatus?: OlderAdultStatus,
        oaDeathDate?: Date,
        oaEconomicIncome?: number,
        oaPhoneNumber?: string,
        oaEmail?: string,
        oaProfilePhotoUrl?: string,
        oaGender?: Gender,
        oaBloodType?: BloodType,
        createAt?: Date,
        idProgram?: number,
        idFamily?: number
    ) {
        this.id = id;
        this.oaIdentification = oaIdentification;
        this.oaName = oaName;
        this.oaFLastName = oaFLastName;
        this.oaPreviousWork = oaPreviousWork;
        this.oaSLastName = oaSLastName;
        this.oaBirthdate = oaBirthdate;
        this.oaMaritalStatus = oaMaritalStatus || MaritalStatus.NOT_SPECIFIED;
        this.oaDwelling = oaDwelling;
        this.oaYearsSchooling = oaYearsSchooling || YearsSchooling.NOT_SPECIFIED;
        this.oaIsRetired = oaIsRetired || false;
        this.oaHasPension = oaHasPension || false;
        this.oaOther = oaOther || false;
        this.oaOtherDescription = oaOtherDescription;
        this.oaAreaOfOrigin = oaAreaOfOrigin;
        this.oaChildrenCount = oaChildrenCount || 0;
        this.oaStatus = oaStatus || OlderAdultStatus.ALIVE;
        this.oaDeathDate = oaDeathDate;
        this.oaEconomicIncome = oaEconomicIncome;
        this.oaPhoneNumber = oaPhoneNumber;
        this.oaEmail = oaEmail;
        this.oaProfilePhotoUrl = oaProfilePhotoUrl;
        this.oaGender = oaGender || Gender.NOT_SPECIFIED;
        this.oaBloodType = oaBloodType || BloodType.UNKNOWN;
        this.createAt = createAt || new Date();
        this.idProgram = idProgram;
        this.idFamily = idFamily;
    }
}