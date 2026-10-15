import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import { Role } from '../auth/core/role.entity';
import { MemoCategory, MemoStatus, MemoUrgency, MemoVisibility } from './memo.enums';
import type { ResidentMemoAcknowledgment } from './resident-memo-acknowledgment.entity';

@Entity({ name: 'resident_memos' })
export class ResidentMemo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tenant_id', type: 'integer', nullable: true })
    tenantId?: number | null;

    @Column({ name: 'older_adult_id', type: 'integer' })
    olderAdultId!: number;

    @Column({ name: 'author_id', type: 'integer' })
    authorId!: number;

    @Column({ name: 'target_user_id', type: 'integer', nullable: true })
    targetUserId?: number | null;

    @Column({ name: 'target_role_id', type: 'integer', nullable: true })
    targetRoleId?: number | null;

    @Column({ name: 'parent_memo_id', type: 'integer', nullable: true })
    parentMemoId?: number | null;

    @Column({ type: 'text' })
    content!: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: MemoCategory.GENERAL,
    })
    category!: MemoCategory;

    @Column({
        type: 'varchar',
        length: 20,
        default: MemoVisibility.PUBLIC,
    })
    visibility!: MemoVisibility;

    @Column({
        type: 'varchar',
        length: 20,
        default: MemoStatus.OPEN,
    })
    status!: MemoStatus;

    @Column({
        type: 'varchar',
        length: 20,
        default: MemoUrgency.ROUTINE,
    })
    urgency!: MemoUrgency;

    @Column({
        type: 'jsonb',
        default: () => "'[]'::jsonb",
    })
    attachments!: Array<{ url: string; name: string; size?: number; type?: string }>;

    @Column({ name: 'is_edited', type: 'boolean', default: false })
    isEdited!: boolean;

    @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
    resolvedAt?: Date | null;

    @Column({ name: 'resolved_by', type: 'integer', nullable: true })
    resolvedBy?: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    // Relations
    @ManyToOne('OlderAdult', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'older_adult_id' })
    olderAdult?: any;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'author_id' })
    author?: User;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'target_user_id' })
    targetUser?: User | null;

    @ManyToOne(() => Role, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'target_role_id' })
    targetRole?: Role | null;

    @ManyToOne(() => ResidentMemo, (memo) => memo.replies, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_memo_id' })
    parentMemo?: ResidentMemo | null;

    @OneToMany(() => ResidentMemo, (memo) => memo.parentMemo)
    replies?: ResidentMemo[];

    @OneToMany('ResidentMemoAcknowledgment', (ack: any) => ack.memo)
    acknowledgments?: any[];
}
