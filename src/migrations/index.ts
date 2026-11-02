import * as migration_20261102_135335_initial from './20261102_135335_initial';

export const migrations = [
  {
    up: migration_20261102_135335_initial.up,
    down: migration_20261102_135335_initial.down,
    name: '20261102_135335_initial'
  },
];
