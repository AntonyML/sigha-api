import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('icd10_catalog')
export class Icd10Catalog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10, unique: true })
    code: string;

    @Column({ length: 255 })
    description: string;

    @Column({ length: 120 })
    category: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
