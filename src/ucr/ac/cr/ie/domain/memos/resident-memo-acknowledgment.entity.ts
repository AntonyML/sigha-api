import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from '../auth/core/user.entity';
import type { ResidentMemo } from './resident-memo.entity';

@Entity({ name: 'resident_memo_acknowledgments' })
@Unique(['memoId', 'userId'])
export class ResidentMemoAcknowledgment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'memo_id', type: 'integer' })
    memoId!: number;

    @Column({ name: 'user_id', type: 'integer' })
    userId!: number;

    @CreateDateColumn({ name: 'acknowledged_at', type: 'timestamptz' })
    acknowledgedAt!: Date;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @ManyToOne('ResidentMemo', (memo: any) => memo.acknowledgments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memo_id' })
    memo?: any;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;
}
