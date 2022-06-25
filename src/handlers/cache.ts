import LRU from 'lru-cache'

/*
 * Cache handler, could be replaced by a Redis instance in more complex API.
 */
export const cache = new LRU({
  max: 500,
  ttl: 300000 /* 5 minutes */,
})
