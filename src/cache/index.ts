import NodeCache from 'node-cache';

/** Add missing type Key */
type Key = string | number;

export default class Cache {

  private cache: NodeCache;

  constructor (options: NodeCache.Options) {
    console.log('Cache was initialized');

    this.cache = new NodeCache(options);
  }

  async get (key: Key, storeFunction: () => Promise<any>) {
    const value = this.cache.get(key);

    if (value) {
      console.log('Return from cache');

      return Promise.resolve(value);
    }

    return storeFunction().then((result: any) => {
      this.cache.set(key, result);
      return result;
    });
  }

  del (keys: Key | Key[]) {
    console.log('Delete cached');
    this.cache.del(keys);
  }

  delStartWith (startStr = '') {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();

    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush () {
    this.cache.flushAll();
  }

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
