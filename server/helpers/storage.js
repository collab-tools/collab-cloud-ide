import config from 'config';
import redis from 'redis';
/* eslint-disable import/no-unresolved */
import dbAppFactory from 'collab-db-application';
/* eslint-enable import/no-unresolved */

const storeClient = redis.createClient();
storeClient.on('error', (err) => {
  throw new Error(`Problem encountered when accessing store. ${err}`);
});

const store = {
  setHash: (hash, mappings) => storeClient.hmsetAsync(hash, mappings),
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
  constructor() {
    if (!storageInstance) {
      storageInstance = {
        app: dbAppFactory(config.database),
        store,
      };
    }
    return storageInstance;
  }
}
