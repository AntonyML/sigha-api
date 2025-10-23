import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vaccines')
export class Vaccine {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'v_name', length: 80 })
    vName: string;

    constructor(id?: number, vName?: string) {
        this.id = id;
        this.vName = vName;
    }
}