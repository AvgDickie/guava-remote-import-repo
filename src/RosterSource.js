import { LockSvc } from './LockSvc.js';
import { remoteImportRepoRosterSources as rosterSources } from './roster-sources.js';

const RosterSource = (() => {
  const PropSvc = {
    SOURCE_LIST: 'remoteImportRepoRosterSources',
  };

  const argObjects = {
    directLink: {
      getFetchArgs(argsObj) {
        return {
          url: argsObj.url,
          options: { method: 'get' },
        };
      },
    },
    fileLu: {
      getFetchArgs(argsObj) {
        const formData = {
          file_code: argsObj.file_code,
          key: argsObj.key,
        };
        return {
          url: 'https://filelu.com/api/file/direct_link',
          options: { method: 'post', payload: formData },
        };
      },
    },
  };

  const randomInt = (min = 0, max = min + 1) => {
    return Math.floor(
      Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min),
    );
  };

  const getFetchRosterArgsObject = srcObject =>
    argObjects[srcObject.type].getFetchArgs(srcObject);

  const getSourceList = () => {
    LockSvc.Prop.Script.get(PropSvc.SOURCE_LIST)
  };

  try {
    src = LockSvc.Cache.Script.get('remoteImportRosterSources');
    if (!src) {
      LockSvc.Cache.Script.set('remoteImportRosterSources', rosterSources);
      src = LockSvc.Cache.Script.get('remoteImportRosterSources');
    }
    if (!(src || Array.isArray(src) || src.length < 1)) {
      throw new Error('Remote import repository roster not found');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  return {
    get: () => getFetchRosterArgsObject(src[randomInt(0, src.length - 1)]),
    getById: id =>
      getFetchRosterArgsObject(src.find(srcObj => srcObj.id === id)),
    getByType: type =>
      getFetchRosterArgsObject(src.find(srcObj => srcObj.type === type)),
    getAll: () => src.map(e => getFetchRosterArgsObject(e)),
  };
})();

export { RosterSource };
