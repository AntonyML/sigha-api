import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { OlderAdult } from '../virtual-records/older-adult.entity';
import { User } from '../auth/core/user.entity';

@Entity({ name: 'patient_lifestyle_assessments' })
export class PatientLifestyleAssessment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_older_adult', type: 'integer' })
    idOlderAdult!: number;

    @Column({ name: 'assessed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    assessedAt!: Date;

    @Column({ name: 'assessed_by', type: 'integer', nullable: true })
    assessedBy?: number;

    // Diet & Nutrition
    @Column({ name: 'diet_type', type: 'varchar', length: 50, default: 'general' })
    dietType!: string;

    @Column({ name: 'diet_consistency', type: 'varchar', length: 50, default: 'regular' })
    dietConsistency!: string;

    @Column({ name: 'diet_allergies_intolerances', type: 'text', nullable: true })
    dietAllergiesIntolerances?: string;

    @Column({ name: 'meals_per_day', type: 'integer', default: 4 })
    mealsPerDay!: number;

    @Column({ name: 'appetite', type: 'varchar', length: 30, default: 'normal' })
    appetite!: string;

    @Column({ name: 'daily_fluid_intake_ml', type: 'integer', default: 1500 })
    dailyFluidIntakeMl!: number;

    @Column({ name: 'requires_fluid_thickener', type: 'boolean', default: false })
    requiresFluidThickener!: boolean;

    @Column({ name: 'diet_notes', type: 'text', nullable: true })
    dietNotes?: string;

    // Sleep & Rest
    @Column({ name: 'sleep_hours_per_night', type: 'numeric', precision: 3, scale: 1, default: 7.0 })
    sleepHoursPerNight!: number;

    @Column({ name: 'sleep_quality', type: 'varchar', length: 30, default: 'good' })
    sleepQuality!: string;

    @Column({ name: 'sleep_medication_required', type: 'boolean', default: false })
    sleepMedicationRequired!: boolean;

    @Column({ name: 'sleep_notes', type: 'text', nullable: true })
    sleepNotes?: string;

    // Physical Activity
    @Column({ name: 'physical_activity_level', type: 'varchar', length: 30, default: 'sedentary' })
    physicalActivityLevel!: string;

    @Column({ name: 'daily_walking_minutes', type: 'integer', default: 15 })
    dailyWalkingMinutes!: number;

    @Column({ name: 'mobility_assistance_required', type: 'boolean', default: false })
    mobilityAssistanceRequired!: boolean;

    @Column({ name: 'physical_activity_notes', type: 'text', nullable: true })
    physicalActivityNotes?: string;

    // Toxic Habits
    @Column({ name: 'smoking_status', type: 'varchar', length: 30, default: 'never' })
    smokingStatus!: string;

    @Column({ name: 'smoking_packs_year', type: 'numeric', precision: 4, scale: 1, default: 0.0 })
    smokingPacksYear!: number;

    @Column({ name: 'alcohol_status', type: 'varchar', length: 30, default: 'never' })
    alcoholStatus!: string;

    // Summary
    @Column({ name: 'lifestyle_summary', type: 'text', nullable: true })
    lifestyleSummary?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @ManyToOne(() => OlderAdult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_older_adult', referencedColumnName: 'id' })
    olderAdult?: OlderAdult;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assessed_by', referencedColumnName: 'id' })
    assessor?: User;
}
