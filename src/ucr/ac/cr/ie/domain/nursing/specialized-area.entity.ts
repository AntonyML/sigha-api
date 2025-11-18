import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum SpecializedAreaName {
    NURSING = 'nursing',
    PHYSIOTHERAPY = 'physiotherapy',
    PSYCHOLOGY = 'psychology',
    SOCIAL_WORK = 'social_work',
    NOT_SPECIFIED = 'not specified'
}

@Entity('specialized_area')
export class SpecializedArea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'sa_name',
        type: 'enum',
        enum: SpecializedAreaName,
        default: SpecializedAreaName.NOT_SPECIFIED
    })
    saName: SpecializedAreaName;

    @Column({ name: 'sa_description', type: 'text', nullable: true })
    saDescription?: string;

    @Column({ name: 'sa_contact_email', length: 256, nullable: true })
    saContactEmail?: string;

    @Column({ name: 'sa_contact_phone', length: 20, nullable: true })
    saContactPhone?: string;

    @Column({ name: 'sa_is_active', default: true })
    saIsActive: boolean;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ name: 'id_manager', nullable: true })
    idManager?: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_manager' })
    manager?: User;

    constructor(
        id?: number,
        saName?: SpecializedAreaName,
        saDescription?: string,
        saContactEmail?: string,
        saContactPhone?: string,
        saIsActive?: boolean,
        createAt?: Date,
        idManager?: number
    ) {
        this.id = id;
        this.saName = saName || SpecializedAreaName.NOT_SPECIFIED;
        this.saDescription = saDescription;
        this.saContactEmail = saContactEmail;
        this.saContactPhone = saContactPhone;
        this.saIsActive = saIsActive !== undefined ? saIsActive : true;
        this.createAt = createAt || new Date();
        this.idManager = idManager;
    }
}
