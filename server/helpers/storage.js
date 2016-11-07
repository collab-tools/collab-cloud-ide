import redis from 'redis';
/* eslint-disable import/no-unresolved */
import dbAppFactory from 'collab-db-application';
/* eslint-enable import/no-unresolved */

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const storeClient = redis.createClient();
storeClient.on('error', (err) => {
  throw new Error(`Problem encountered when accessing store. ${err}`);
});

const store = {
  setHash: (hash, mappings) => storeClient.hmsetAsync(mappings),
  setMapping: (hash, mapping) => storeClient.hsetAsync(hash, mapping.key, mapping.value),
  removeHash: hash => storeClient.delAsync(hash),
  removeMapping: (hash, mapping) => storeClient.hdelAsync(hash, mapping),
  getHashes: regex => storeClient.keysAsync(regex),
  getHash: hash => storeClient.hgetallAsync(hash),
  getMapping: (hash, key) => storeClient.hgetAsync(hash, key),
  isExist: hash => storeClient.existsAsync(hash),
  isExistMapping: (hash, key) => storeClient.hexistsAsync(hash, key),
};


let storageInstance = null;

export default class storageHelper {
  constructor(dbConfig) {
    if (!storageInstance) {
      storageInstance = {
        app: dbAppFactory(dbConfig.dbApp),
        store,
      };
    }
    return storageInstance;
  }
}
