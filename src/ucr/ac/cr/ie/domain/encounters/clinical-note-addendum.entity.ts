import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

@Entity({ name: 'clinical_note_addendums' })
export class ClinicalNoteAddendum {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_encounter', type: 'integer' })
    idEncounter!: number;

    @Column({ name: 'author_id', type: 'integer' })
    authorId!: number;

    @Column({ name: 'addendum_text', type: 'text' })
    addendumText!: string;

    @Column({ name: 'reason_for_addendum', type: 'text' })
    reasonForAddendum!: string;

    @Column({ name: 'signed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    signedAt!: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne('ClinicalEncounter', 'addendums', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_encounter' })
    encounter?: any;

    @ManyToOne('User', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'author_id' })
    author?: any;
}
