import NodeCache from 'node-cache';

/** Add missing type Key */
type Key = string | number;

export default class Cache {

  private cache: NodeCache;

  constructor (options: NodeCache.Options) {
    this.cache = new NodeCache(options);
  }

  /**
   * Try to get value from cache
   * Otherwise run function-initiator, cache value and return it.
   *
   * @param {Key} key - cache item identifier
   * @param {() => Promise<any>} storeFunction - function which response you are waiting for
   * @return {Promise<any>}
   */
  async get (key: Key, storeFunction: () => Promise<any>) {
    const value = this.cache.get(key);

    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then((result: any) => {
      this.cache.set(key, result);
      return result;
    });
  }

  /**
   * Clear target cached data
   *
   * @param {Key | Key[]} keys
   */
  del (keys: Key | Key[]) {
    this.cache.del(keys);
  }

  /**
   * Clear all cache
   */
  flush () {
    this.cache.flushAll();
  }

  /**
   * Time parts in seconds
   *
   * @return {{SECOND: number; MINUTE: number; HOUR: number; DAY: number; WEEK: number}}
   */
  static get time () {
    return {
      SECOND: 1,
      MINUTE: 60,
      HOUR: 3600,
      DAY: 84600,
      WEEK: 604800
    };
  }
}
