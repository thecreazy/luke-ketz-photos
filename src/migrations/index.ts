import * as migration_20261102_135335_initial from './20261102_135335_initial';
import * as migration_20261105_092501_pages_copy from './20261105_092501_pages_copy';
import * as migration_20261105_095318_media_alt_optional from './20261105_095318_media_alt_optional';
import * as migration_20261105_102141_gallery_viewer_copy from './20261105_102141_gallery_viewer_copy';

export const migrations = [
  {
    up: migration_20261102_135335_initial.up,
    down: migration_20261102_135335_initial.down,
    name: '20261102_135335_initial',
  },
  {
    up: migration_20261105_092501_pages_copy.up,
    down: migration_20261105_092501_pages_copy.down,
    name: '20261105_092501_pages_copy',
  },
  {
    up: migration_20261105_095318_media_alt_optional.up,
    down: migration_20261105_095318_media_alt_optional.down,
    name: '20261105_095318_media_alt_optional',
  },
  {
    up: migration_20261105_102141_gallery_viewer_copy.up,
    down: migration_20261105_102141_gallery_viewer_copy.down,
    name: '20261105_102141_gallery_viewer_copy'
  },
];
