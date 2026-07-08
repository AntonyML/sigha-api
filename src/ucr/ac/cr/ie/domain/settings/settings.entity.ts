import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  category: string;

  @Column({ type: 'jsonb' })
  settings: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
