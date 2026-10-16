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

    @Column({ name: 'signed_by', type: 'integer' })
    signedBy!: number;

    @Column({ name: 'signature_hash', type: 'varchar', length: 64 })
    signatureHash!: string;

    @Column({ name: 'signature_version', type: 'varchar', length: 32, default: '1' })
    signatureVersion!: string;

    @Column({ name: 'status', type: 'varchar', length: 16, default: 'signed' })
    status!: 'signed';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne('ClinicalEncounter', 'addendums', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_encounter' })
    encounter?: any;

    @ManyToOne('User', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'author_id' })
    author?: any;
}
