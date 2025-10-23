import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SubProgram } from './sub-program.entity';

@Entity('programs')
export class Program {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'p_name', length: 300 })
    pName: string;

    @Column({ name: 'create_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @OneToMany(() => SubProgram, subProgram => subProgram.program)
    subPrograms?: SubProgram[];

    constructor(id?: number, pName?: string, createAt?: Date) {
        this.id = id;
        this.pName = pName;
        this.createAt = createAt || new Date();
    }
}