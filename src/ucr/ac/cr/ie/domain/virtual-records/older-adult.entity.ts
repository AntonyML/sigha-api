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
    UNIVERSITY = 'university',
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

    @Column({ name: 'oa_identification', length: 20, unique: true, nullable: false })
    oaIdentification: string;

    @Column({ name: 'oa_document_type', length: 20, nullable: false, default: 'nacional' })
    oaDocumentType: string;

    @Column({ name: 'oa_name', length: 50, nullable: false })
    oaName: string;

    @Column({ name: 'oa_f_last_name', length: 50, nullable: false })
    oaFLastName: string;

    @Column({ name: 'oa_s_last_name', length: 50, nullable: true })
    oaSLastName?: string;

    @Column({ name: 'oa_birthdate', type: 'date', nullable: true })
    oaBirthdate?: Date;

    @Column({
        name: 'oa_marital_status',
        type: 'enum',
        enum: MaritalStatus,
        nullable: false,
        default: MaritalStatus.NOT_SPECIFIED
    })
    oaMaritalStatus: MaritalStatus;

    @Column({ name: 'oa_dwelling', type: 'text', nullable: true })
    oaDwelling?: string;

    @Column({
        name: 'oa_years_schooling',
        type: 'enum',
        enum: YearsSchooling,
        nullable: false,
        default: YearsSchooling.NOT_SPECIFIED
    })
    oaYearsSchooling: YearsSchooling;

    @Column({ name: 'oa_previous_work', length: 300, nullable: false })
    oaPreviousWork: string;

    @Column({ name: 'oa_is_retired', nullable: false, default: false })
    oaIsRetired: boolean;

    @Column({ name: 'oa_has_pension', nullable: false, default: false })
    oaHasPension: boolean;

    @Column({ name: 'oa_other', nullable: false, default: false })
    oaOther: boolean;

    @Column({ name: 'oa_other_description', length: 300, nullable: true })
    oaOtherDescription?: string;

    @Column({ name: 'oa_province', length: 100, nullable: true })
    oaProvince?: string;

    @Column({ name: 'oa_canton', length: 100, nullable: true })
    oaCanton?: string;

    @Column({ name: 'oa_district', length: 100, nullable: true })
    oaDistrict?: string;

    @Column({ name: 'oa_children_count', type: 'smallint', nullable: false, default: 0 })
    oaChildrenCount: number;

    @Column({
        name: 'oa_status',
        type: 'enum',
        enum: OlderAdultStatus,
        nullable: false,
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
        nullable: false,
        default: Gender.NOT_SPECIFIED
    })
    oaGender: Gender;

    @Column({
        name: 'oa_blood_type',
        type: 'enum',
        enum: BloodType,
        nullable: false,
        default: BloodType.UNKNOWN
    })
    oaBloodType: BloodType;

    @Column({ name: 'oa_is_active', nullable: false, default: true })
    oaIsActive: boolean;

    @Column({ name: 'create_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_program', nullable: true })
    idProgram?: number;

    @Column({ name: 'id_family', nullable: true })
    idFamily?: number;

    @ManyToOne(() => Program, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_program' })
    program?: Program;

    @ManyToOne(() => OlderAdultFamily, { onDelete: 'SET NULL' })
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
        oaProvince?: string,
        oaCanton?: string,
        oaDistrict?: string,
        oaChildrenCount?: number,
        oaStatus?: OlderAdultStatus,
        oaDeathDate?: Date,
        oaEconomicIncome?: number,
        oaPhoneNumber?: string,
        oaEmail?: string,
        oaProfilePhotoUrl?: string,
        oaGender?: Gender,
        oaBloodType?: BloodType,
        oaIsActive?: boolean,
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
        this.oaProvince = oaProvince;
        this.oaCanton = oaCanton;
        this.oaDistrict = oaDistrict;
        this.oaChildrenCount = oaChildrenCount || 0;
        this.oaStatus = oaStatus || OlderAdultStatus.ALIVE;
        this.oaDeathDate = oaDeathDate;
        this.oaEconomicIncome = oaEconomicIncome;
        this.oaPhoneNumber = oaPhoneNumber;
        this.oaEmail = oaEmail;
        this.oaProfilePhotoUrl = oaProfilePhotoUrl;
        this.oaGender = oaGender || Gender.NOT_SPECIFIED;
        this.oaBloodType = oaBloodType || BloodType.UNKNOWN;
        this.oaIsActive = oaIsActive !== undefined ? oaIsActive : true;
        this.createAt = createAt || new Date();
        this.idProgram = idProgram;
        this.idFamily = idFamily;
    }
}