// =================================================================================================
// URL
// =================================================================================================

const url = (url) => {
  if (typeof url !== 'string') {
    throw new TypeError('Invalid argument: "url", must be a string');
  }
  const urlClosure = () => url;
  return urlClosure;
};

describe('entities/url', () => {
  it('should throw an error if the "url" argument is not a string', () => {
    expect(() => url(1)).toThrow();
  });
  it('should be a closure', () => {
    expect(url('http://ds9')).toBeInstanceOf(Function);
  });
});

// =================================================================================================
// SERVICE
// =================================================================================================

const service = (baseUrl) => {
  if (typeof baseUrl !== 'string') {
    throw new TypeError('Invalid argument: "baseUrl", must be a string');
  }
  const actions = {};
  const service = (actionName) => {
    if (typeof actionName !== 'string') {
      throw new TypeError('Invalid argument: "actionName", must be a string');
    }
    return actions[actionName];
  };

  service.action = (name, method, path) => {
    if (typeof name !== 'string') {
      throw new TypeError('Invalid argument: "name", must be a string');
    }
    if (typeof method !== 'string') {
      throw new TypeError('Invalid argument: "method", must be a string');
    }
    if (typeof path !== 'string') {
      throw new TypeError('Invalid argument: "path", must be a string');
    }
    actions[name] = {
      name,
      method,
      url: url(`${baseUrl}${path}`),
      service,
    };
  };
  service.toString = () => baseUrl;
  return service;
};

describe('entities/service', () => {
  it('should be a closure', () => {
    expect(service('https://ds9')).toBeInstanceOf(Function);
  });
  it('should throw an error if the "url" argument is not a string', () => {
    expect(() => service(1)).toThrow();
  });
  it('should render the url when converted toString', () => {
    expect(service('https://ds9').toString()).toBe('https://ds9');
  });
  describe('service.action()', () => {
    let testService;
    beforeEach(() => {
      testService = service('https://enterprise');
    });
    it('should throw an error if the "name" argument is not a string', () => {
      expect(() => testService.action(1, 'get', '/captain')).toThrow();
    });
    it('should throw an error if the "method" argument is not a string', () => {
      expect(() => testService.action('getCaptain', 1, '/captain')).toThrow();
    });
    it('should throw an error if the "path" argument is not a string', () => {
      expect(() => testService.action('getCaptain', 'get', 1)).toThrow();
    });
    it('should properly add the action to the service', () => {
      testService.action('getCaptain', 'get', '/captain');
      expect(testService('getCaptain')).toBeInstanceOf(Object);
    });
    it('should add the action with a reference to the service', () => {
      testService.action('getCaptain', 'get', '/captain');
      expect(testService('getCaptain').service).toBe(testService);
    });
    it('should add the action with a proper url entity', () => {
      testService.action('getCaptain', 'get', '/captain');
      expect(testService('getCaptain').url).toBeInstanceOf(Function);
      // TODO: Test that URL contains baseUrl + path
    });
    it('should add the action with the method', () => {
      testService.action('getCaptain', 'get', '/captain');
      expect(testService('getCaptain').method).toEqual('get');
    });
  });
  describe('service.headers', () => {
    it.todo('should add headers for the service');
    it.todo('should add multiple headers for the service');
  });
});

// =================================================================================================
// REQUEST
// =================================================================================================

const got = require('got');

const sendRequest = (method, url, data, options) => (
  got[method.toLowerCase()](url(data.params || {}), {
    headers: data.headers || {},
    json: data.body || {},
    allowGetBody: true,
    responseType: 'json',
  })
);

const doServiceRequest = (action, data = {}, options = {}) => {
  if (typeof data !== 'object') {
    throw new TypeError('Invalid argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid argument: "options", must be an object');
  }
  // const mergedData = {
  //   ...data,
  //   ...servicePath.service.data,
  // };
  // const mergedOptions = {
  //   ...options,
  //   ...servicePath.service.options,
  // };
  return sendRequest(action.method, action.url, data, options);
};

const doDirectRequest = (method, url, data = {}, options = {}) => {
  if (typeof url !== 'function') {
    throw new TypeError('Invalid argument: "url", must be a function');
  }
  if (typeof data !== 'object') {
    throw new TypeError('Invalid argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid argument: "options", must be an object');
  }
  return sendRequest(method, url, data, options);
};

const request = (...args) => {
  if (typeof args[0] === 'object') {
    return doServiceRequest(...args); // request(service('action'), data, options)
  }
  if (typeof args[0] === 'string') { // request('get', url('http://localhost'), data, options)
    return doDirectRequest(...args);
  }
  throw new TypeError('Invalid arguments');
};

const nock = require('nock');

describe('services/request', () => {
  let testService;
  beforeEach(() => {
    testService = service('https://voyager');
    testService.action('callJaneway', 'get', '/janeway');
  });
  it.todo('should return a Promise');
  it('should throw an error if the first argument is neither a string nor an object', () => {
    nock('https://voyager').get('/janeway').times(2).reply(200, { response: 'Amomawe' });
    expect(() => request('get', url('https://voyager/janeway'))).not.toThrow();
    expect(() => request(testService('callJaneway'))).not.toThrow();
    expect(() => request(true)).toThrow();
  });
  describe('Called with a service action', () => {
    it('should throw an error if the "data" argument is not an object', () => {
      expect(() => request(testService('callJaneway'), 1)).toThrow();
    });
    it('should throw an error if the "options" argument is not an object', () => {
      expect(() => request(testService('callJaneway'), {}, 1)).toThrow();
    });
    it('should properly do the request', async () => {
      nock('https://voyager').get('/janeway').reply(200, { response: 'Amomawe' });
      const { statusCode, body } = await request(testService('callJaneway'));
      expect(statusCode).toEqual(200);
      expect(body).toEqual({ response: 'Amomawe' });
    });
  });
  describe('Called with a method and a url', () => {
    it('should throw an error if the "url" argument is not a function', () => {
      expect(() => request('get', 'https://voyager')).toThrow();
    });
    it('should throw an error if the "data" argument is not an object', () => {
      expect(() => request('get', url('https://voyager'), 1)).toThrow();
    });
    it('should throw an error if the "options" argument is not an object', () => {
      expect(() => request('get', url('https://voyager'), {}, 1)).toThrow();
    });
  });
});
