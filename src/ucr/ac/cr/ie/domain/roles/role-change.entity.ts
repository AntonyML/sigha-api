import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';
import { Role } from '../auth/core/role.entity';

@Entity('role_changes')
export class RoleChange {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'rc_old_role', length: 50, nullable: true })
    rcOldRole: string | null;

    @Column({ name: 'rc_new_role', length: 50, nullable: true })
    rcNewRole: string | null;

    @Column({ name: 'old_role_id', type: 'int', nullable: true })
    oldRoleId: number | null;

    @Column({ name: 'new_role_id', type: 'int', nullable: true })
    newRoleId: number | null;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;

    @Column({ name: 'id_user' })
    idUser: number;

    @Column({ name: 'changed_by' })
    changedBy: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_user' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changedByUser: User;

    @ManyToOne(() => Role, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'old_role_id' })
    oldRole: Role | null;

    @ManyToOne(() => Role, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'new_role_id' })
    newRole: Role | null;
}
