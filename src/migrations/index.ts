import * as migration_20260228_131329 from './20260228_131329'
import * as migration_20260317_074300 from './20260317_074300'

export const migrations = [
  {
    up: migration_20260228_131329.up,
    down: migration_20260228_131329.down,
    name: '20260228_131329',
  },
  {
    up: migration_20260317_074300.up,
    down: migration_20260317_074300.down,
    name: '20260317_074300',
  },
]
