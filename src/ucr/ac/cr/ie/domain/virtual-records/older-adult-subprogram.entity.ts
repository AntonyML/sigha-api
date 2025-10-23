import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OlderAdult } from './older-adult.entity';
import { SubProgram } from './sub-program.entity';

@Entity('older_adult_subprogram')
export class OlderAdultSubprogram {
    @PrimaryColumn({ name: 'id_older_adult' })
    idOlderAdult: number;

    @PrimaryColumn({ name: 'id_sub_program' })
    idSubProgram: number;

    @ManyToOne(() => OlderAdult)
    @JoinColumn({ name: 'id_older_adult' })
    olderAdult?: OlderAdult;

    @ManyToOne(() => SubProgram)
    @JoinColumn({ name: 'id_sub_program' })
    subProgram?: SubProgram;

    constructor(
        idOlderAdult?: number,
        idSubProgram?: number
    ) {
        this.idOlderAdult = idOlderAdult;
        this.idSubProgram = idSubProgram;
    }
}