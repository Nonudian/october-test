import LRU from 'lru-cache'
import { MAX_STORED_ITEMS, MAX_TTL } from '../config'

/* Cache handler (could be replaced by a Redis instance in more complex API) */
export const cache = new LRU({
  max: MAX_STORED_ITEMS,
  ttl: MAX_TTL,
})
