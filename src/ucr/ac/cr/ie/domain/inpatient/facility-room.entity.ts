import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany
} from 'typeorm';

@Entity({ name: 'facility_rooms' })
export class FacilityRoom {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'room_number', type: 'varchar', length: 20, unique: true })
    roomNumber!: string;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name!: string;

    @Column({ name: 'floor_wing', type: 'varchar', length: 50, nullable: true })
    floorWing?: string;

    @Column({ name: 'capacity', type: 'integer', default: 1 })
    capacity!: number;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @OneToMany('PatientBedAssignment', 'room')
    bedAssignments?: any[];
}
