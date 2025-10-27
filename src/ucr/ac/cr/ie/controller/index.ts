export * from './auth';
export * from './users';
export * from './roles';
export * from './entrances-exits';
export * from './virtual-records';
// Export notifications controller explicitly to avoid TS module resolution edge cases in the editor
export * from './notifications/notifications.controller';