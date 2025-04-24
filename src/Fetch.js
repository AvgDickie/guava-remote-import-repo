const Fetch = (() => {
  const config = {
    defaultOptions: {
      method: 'get',
      headers: {},
      payload: null,
      muteHttpExceptions: true,
      validateHttpsCertificates: true,
      followRedirects: true,
      contentType: 'application/x-www-form-urlencoded',
      escaping: true,
    },
    retry: {
      maxRetries: 5,
      initialDelay: 500,
      backoffFactor: 2,
    },
  };

  const retryFetch = fetchFunction => {
    let attempt = 0;
    let delay = config.retry.initialDelay;

    while (attempt < config.retry.maxRetries) {
      try {
        return fetchFunction();
      } catch (e) {
        if (attempt === config.retry.maxRetries - 1) throw e;
        Utilities.sleep(delay);
        delay *= config.retry.backoffFactor;
        attempt++;
      }
    }
  };

  class Fetch {
    constructor({ options = {}, retry = {} } = {}) {
      config.defaultOptions = { ...config.defaultOptions, ...options };
      config.retry = { ...config.retry, ...retry };
      Object.freeze(this);
      Object.freeze(Fetch);
    }

    fetch(url, options = {}) {
      const fetchOptions = { ...config.defaultOptions, ...options };
      return retryFetch(() => UrlFetchApp.fetch(url, fetchOptions));
    }

    fetchAll(requests) {
      const fetchRequests = requests.map(req => ({
        url: req.url,
        options: { ...config.defaultOptions, ...req.options },
      }));
      return retryFetch(() => UrlFetchApp.fetchAll(fetchRequests));
    }
  }

  return Fetch;
})();

export { Fetch };
