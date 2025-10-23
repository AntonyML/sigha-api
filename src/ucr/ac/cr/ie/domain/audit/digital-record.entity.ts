import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  OTHER = 'other'
}

@Entity('digital_record')
export class DigitalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dr_user_id' })
  drUserId: number;

  @Column({ 
    name: 'dr_action', 
    type: 'enum',
    enum: AuditAction,
    default: AuditAction.OTHER 
  })
  drAction: AuditAction;

  @Column({ name: 'dr_table_name', nullable: true, length: 100 })
  drTableName?: string;

  @Column({ name: 'dr_record_id', nullable: true })
  drRecordId?: number;

  @Column({ name: 'dr_description', type: 'text', nullable: true })
  drDescription?: string;

  @CreateDateColumn({ name: 'dr_timestamp' })
  drTimestamp: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dr_user_id' })
  user: User;
}
