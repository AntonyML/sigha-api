import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

@Entity({ name: 'patient_bed_assignments' })
export class PatientBedAssignment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'id_room', type: 'integer' })
    idRoom!: number;

    @Column({ name: 'bed_label', type: 'varchar', length: 20, default: 'Cama 1' })
    bedLabel!: string;

    @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt!: Date;

    @Column({ name: 'discharged_at', type: 'timestamptz', nullable: true })
    dischargedAt?: Date;

    @Column({ name: 'is_current', type: 'boolean', default: true })
    isCurrent!: boolean;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: any;

    @ManyToOne('FacilityRoom', 'bedAssignments', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_room' })
    room?: any;
}
