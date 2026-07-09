import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum KinshipType {
    SON = 'son',
    DAUGHTER = 'daughter',
    GRANDSON = 'grandson',
    GRANDDAUGHTER = 'granddaughter',
    BROTHER = 'brother',
    SISTER = 'sister',
    NEPHEW = 'nephew',
    NIECE = 'niece',
    HUSBAND = 'husband',
    WIFE = 'wife',
    LEGAL_GUARDIAN = 'legal guardian',
    OTHER = 'other',
    NOT_SPECIFIED = 'not specified'
}

@Entity('older_adult_family')
export class OlderAdultFamily {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'pf_identification', length: 20, nullable: false })
    pfIdentification: string;

    @Column({ name: 'pf_document_type', length: 20, nullable: false, default: 'nacional' })
    pfDocumentType: string;

    @Column({ name: 'pf_name', length: 50, nullable: false })
    pfName: string;

    @Column({ name: 'pf_f_last_name', length: 50, nullable: false })
    pfFLastName: string;

    @Column({ name: 'pf_s_last_name', length: 50, nullable: false })
    pfSLastName: string;

    @Column({ name: 'pf_phone_number', length: 20, nullable: true })
    pfPhoneNumber?: string;

    @Column({ name: 'pf_email', length: 256, nullable: true })
    pfEmail?: string;

    @Column({
        name: 'pf_kinship',
        type: 'enum',
        enum: KinshipType,
        nullable: false,
        default: KinshipType.NOT_SPECIFIED
    })
    pfKinship: KinshipType;

    @Column({ name: 'pf_is_active', nullable: false, default: true })
    pfIsActive: boolean;

    @Column({ name: 'create_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    constructor(
        id?: number,
        pfIdentification?: string,
        pfDocumentType?: string,
        pfName?: string,
        pfFLastName?: string,
        pfSLastName?: string,
        pfPhoneNumber?: string,
        pfEmail?: string,
        pfKinship?: KinshipType,
        pfIsActive?: boolean,
        createAt?: Date
    ) {
        this.id = id;
        this.pfIdentification = pfIdentification;
        this.pfDocumentType = pfDocumentType || 'nacional';
        this.pfName = pfName;
        this.pfFLastName = pfFLastName;
        this.pfSLastName = pfSLastName;
        this.pfPhoneNumber = pfPhoneNumber;
        this.pfEmail = pfEmail;
        this.pfKinship = pfKinship || KinshipType.NOT_SPECIFIED;
        this.pfIsActive = pfIsActive !== undefined ? pfIsActive : true;
        this.createAt = createAt || new Date();
    }
}