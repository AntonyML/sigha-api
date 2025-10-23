import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('programs')
export class Program {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'p_name', length: 300 })
    pName: string;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    constructor(id?: number, pName?: string, createAt?: Date) {
        this.id = id;
        this.pName = pName;
        this.createAt = createAt || new Date();
    }
}