import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

export enum PermissionModule {
  USERS                    = 'users',
  ROLES                    = 'roles',
  PERMISSIONS              = 'permissions',
  DASHBOARD                = 'dashboard',
  VIRTUAL_FILES            = 'virtualFiles',
  AUDITS                   = 'audits',
  PROGRAMS                 = 'programs',
  VACCINES                 = 'vaccines',
  SUB_PROGRAMS             = 'subPrograms',
  ENTRANCE_EXIT            = 'entranceExit',
  TWO_FACTOR               = 'twoFactor',
  NURSING                  = 'nursing',
  PHYSIOTHERAPY            = 'physiotherapy',
  PSYCHOLOGY               = 'psychology',
  SOCIAL_WORK              = 'socialWork',
  CLINICAL_HISTORY         = 'clinicalHistory',
  CLINICAL_MEDICATION      = 'clinicalMedication',
  MEDICAL_RECORDS          = 'medicalRecords',
  EMERGENCY_CONTACTS       = 'emergencyContacts',
  OLDER_ADULT_FAMILY       = 'olderAdultFamily',
  OLDER_ADULT_UPDATES      = 'olderAdultUpdates',
  SPECIALIZED_AREAS        = 'specializedAreas',
  SPECIALIZED_APPOINTMENTS = 'specializedAppointments',
}

export enum PermissionAction {
  VIEW   = 'view',
  CREATE = 'create',
  EDIT   = 'edit',
  DELETE = 'delete',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'p_name', length: 100 })
  pName: string;

  @Column({ name: 'p_description', length: 255, default: '' })
  pDescription: string;

  @Column({ name: 'p_module', type: 'enum', enum: PermissionModule })
  pModule: PermissionModule;

  @Column({ name: 'p_action', type: 'enum', enum: PermissionAction })
  pAction: PermissionAction;

  @Column({ name: 'p_enabled', default: true })
  pEnabled: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[];
}
