import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Index('idx_user_roles_user', ['userId'])
@Index('idx_user_roles_role', ['roleId'])
@Index('idx_user_roles_primary', ['userId'])
@Index('idx_user_roles_assigned_by', ['assignedBy'])
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'role_id' })
    roleId: number;

    @Column({ name: 'is_primary', default: false })
    isPrimary: boolean;

    @Column({ name: 'assigned_by', nullable: true })
    assignedBy: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Role, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_by' })
    assignedByUser: User | null;

    constructor(
        id: number,
        userId: number,
        roleId: number,
        isPrimary: boolean = false,
        assignedBy: number | null = null,
        createdAt?: Date,
    ) {
        this.id = id;
        this.userId = userId;
        this.roleId = roleId;
        this.isPrimary = isPrimary;
        this.assignedBy = assignedBy;
        this.createdAt = createdAt || new Date();
    }
}
