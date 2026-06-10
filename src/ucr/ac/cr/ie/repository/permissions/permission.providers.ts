import { DataSource } from 'typeorm';
import { Permission } from '../../domain/permissions/permission.entity';
import { RolePermission } from '../../domain/permissions/role-permission.entity';

export const permissionProviders = [
  {
    provide: 'PermissionRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Permission),
    inject: ['DataSource'],
  },
  {
    provide: 'RolePermissionRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RolePermission),
    inject: ['DataSource'],
  },
];
