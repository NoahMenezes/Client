import * as migration_20260223_141143_fix_schema from './20260223_141143_fix_schema';

export const migrations = [
  {
    up: migration_20260223_141143_fix_schema.up,
    down: migration_20260223_141143_fix_schema.down,
    name: '20260223_141143_fix_schema'
  },
];
