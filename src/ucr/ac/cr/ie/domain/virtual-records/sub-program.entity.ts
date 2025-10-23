import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Program } from './program.entity';

@Entity('sub_programs')
export class SubProgram {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sp_name', length: 50 })
    spName: string;

    @Column({ name: 'id_program' })
    idProgram: number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'id_program' })
    program: Program;

    constructor(id?: number, spName?: string, idProgram?: number) {
        this.id = id;
        this.spName = spName;
        this.idProgram = idProgram;
    }
}