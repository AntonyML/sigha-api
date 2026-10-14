import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AdministrationRoute {
    ORAL = 'oral',
    SUBLINGUAL = 'sublingual',
    INTRAMUSCULAR = 'intramuscular',
    INTRAVENOUS = 'intravenous',
    SUBCUTANEOUS = 'subcutaneous',
    TOPICAL = 'topical',
    INHALATION = 'inhalation',
    OPHTHALMIC = 'ophthalmic',
    OTIC = 'otic',
    NASAL = 'nasal',
    RECTAL = 'rectal',
    OTHER = 'other',
}

@Entity('medication_catalog')
export class MedicationCatalog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 150 })
    name: string;

    @Column({ name: 'active_substance', length: 150 })
    activeSubstance: string;

    @Column({ length: 80 })
    concentration: string;

    @Column({ name: 'pharmaceutical_form', length: 80 })
    pharmaceuticalForm: string;

    @Column({
        name: 'default_route',
        type: 'enum',
        enum: AdministrationRoute,
        default: AdministrationRoute.ORAL,
    })
    defaultRoute: AdministrationRoute;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
