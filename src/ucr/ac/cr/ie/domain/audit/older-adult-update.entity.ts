import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/core/user.entity';

@Entity('older_adult_updates')
export class OlderAdultUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'oau_field_changed', length: 100 })
  oauFieldChanged: string;

  @Column({ name: 'oau_old_value', type: 'text', nullable: true })
  oauOldValue?: string;

  @Column({ name: 'oau_new_value', type: 'text', nullable: true })
  oauNewValue?: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @Column({ name: 'id_older_adult' })
  idOlderAdult: number;

  @Column({ name: 'changed_by' })
  changedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;
}
