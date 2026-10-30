import * as migration_20261024_104542_initial from './20261024_104542_initial';
import * as migration_20261024_105630_images from './20261024_105630_images';
import * as migration_20261024_110109_drafts from './20261024_110109_drafts';
import * as migration_20261030_080423_gallery_access from './20261030_080423_gallery_access';

export const migrations = [
  {
    up: migration_20261024_104542_initial.up,
    down: migration_20261024_104542_initial.down,
    name: '20261024_104542_initial',
  },
  {
    up: migration_20261024_105630_images.up,
    down: migration_20261024_105630_images.down,
    name: '20261024_105630_images',
  },
  {
    up: migration_20261024_110109_drafts.up,
    down: migration_20261024_110109_drafts.down,
    name: '20261024_110109_drafts',
  },
  {
    up: migration_20261030_080423_gallery_access.up,
    down: migration_20261030_080423_gallery_access.down,
    name: '20261030_080423_gallery_access'
  },
];
