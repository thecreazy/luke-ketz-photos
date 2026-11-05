import * as migration_20261102_135335_initial from './20261102_135335_initial';
import * as migration_20261105_092501_pages_copy from './20261105_092501_pages_copy';

export const migrations = [
  {
    up: migration_20261102_135335_initial.up,
    down: migration_20261102_135335_initial.down,
    name: '20261102_135335_initial',
  },
  {
    up: migration_20261105_092501_pages_copy.up,
    down: migration_20261105_092501_pages_copy.down,
    name: '20261105_092501_pages_copy'
  },
];
