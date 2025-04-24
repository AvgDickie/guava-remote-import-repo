'use strict';
const LockSvc = (() => {
  const config = {
    CACHE_DEFAULT_EXPIRY: 21600,
    EXEC_MAX_MS: 360000,
    LOCK_DEFAULT_MAX_WAIT: 60000,
    PROPERTIES_VALUE_MAX_SIZE: 9000,
    PROPERTIES_TOTAL_SIZE: 500000,
    CACHE_VALUE_MAX_SIZE: 100000,
    CACHE_TOTAL_COUNT: 1000,
  };

  const lockFn = {
    _locker(cbFn) {
      try {
        this.lock.waitLock(this.waitLock);
        return cbFn();
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.lock.releaseLock();
      }
    },
    lockMaxWait(waitInMS) {
      if (!(waitInMS > 0 && waitInMS <= config.EXEC_MAX_MS - 1)) {
        throw new RangeError(`Invalid lock wait time: ${waitInMS}`);
      }
      this.waitLock = waitInMS;
      return this;
    },
  };

  class SvcLock {
    constructor() {
      throw new Error('SvcLock is a static class');
    }

    static get Cache() {
      class CacheFn {
        constructor(lock, cacheSvcType) {
          this.waitLock = config.LOCK_DEFAULT_MAX_WAIT;
          this.lock = lock;
          this.cacheSvcType = cacheSvcType;
        }
        get(key) {
          return this._locker(() => {
            return this.cacheSvcType.get(key);
          });
        }

        getAll(keyArray) {
          return this._locker(() => {
            return this.cacheSvcType.getAll(keyArray);
          });
        }

        set(key, value, expires = config.CACHE_DEFAULT_EXPIRY) {
          return this._locker(() => {
            return this.cacheSvcType.put(key, value, expires);
          });
        }

        setPairs(keyValuePairsObject, expires = config.CACHE_DEFAULT_EXPIRY) {
          return this._locker(() => {
            return this.cacheSvcType.putAll(keyValuePairsObject, expires);
          });
        }

        delete(key) {
          return this._locker(() => {
            return this.cacheSvcType.remove(key);
          });
        }

        purge(keysArray) {
          return this._locker(() => {
            return this.cacheSvcType.removeAll(keysArray);
          });
        }
      }

      Object.assign(CacheFn.prototype, lockFn);

      class Cache {
        constructor() {
          throw new Error('Cache is a static class');
        }

        static get User() {
          return new CacheFn(
            LockService.getUserLock(),
            CacheService.getUserCache(),
          );
        }

        static get Script() {
          return new CacheFn(
            LockService.getScriptLock(),
            CacheService.getScriptCache(),
          );
        }

        static get Document() {
          return new CacheFn(
            LockService.getDocumentLock(),
            CacheService.getDocumentCache(),
          );
        }
      }

      return Cache;
    }

    static get Prop() {
      class PropFn {
        constructor(lock, propSvcType) {
          this.waitLock = config.LOCK_DEFAULT_MAX_WAIT;
          this.lock = lock;
          this.propSvcType = propSvcType;
        }

        get(key) {
          return this._locker(() => {
            return this.propSvcType.getProperty(key);
          });
        }

        getAll() {
          return this._locker(() => {
            return this.propSvcType.getProperties();
          });
        }

        set(key, value) {
          return this._locker(() => {
            return this.propSvcType.setProperty(key, value);
          });
        }

        setPairs(keyValuePairsObject) {
          return this._locker(() => {
            return this.propSvcType.setProperties(keyValuePairsObject);
          });
        }

        replace(keyValuePairsObject) {
          return this._locker(() => {
            return this.propSvcType.setProperties(keyValuePairsObject, true);
          });
        }

        delete(key) {
          return this._locker(() => {
            return this.propSvcType.deleteProperty(key);
          });
        }

        purge() {
          return this._locker(() => {
            return this.propSvcType.deleteAllProperties();
          });
        }
      }

      Object.assign(PropFn.prototype, lockFn);

      class Prop {
        constructor() {
          throw new Error('Prop is a static class');
        }

        static get User() {
          return new PropFn(
            LockService.getUserLock(),
            PropertiesService.getUserProperties(),
          );
        }

        static get Script() {
          return new PropFn(
            LockService.getScriptLock(),
            PropertiesService.getScriptProperties(),
          );
        }

        static get Document() {
          return new PropFn(
            LockService.getDocumentLock(),
            PropertiesService.getDocumentProperties(),
          );
        }
      }

      return Prop;
    }
  }

  return {
    get Prop() {
      return SvcLock.Prop;
    },
    get Cache() {
      return SvcLock.Cache;
    },
  };
})();

export { LockSvc };
