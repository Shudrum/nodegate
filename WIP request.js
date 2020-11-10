// =================================================================================================
// URL
// =================================================================================================

const url = (url) => {
  if (typeof url !== 'string') {
    throw new TypeError('Invalid argument: "url", must be a string');
  }

  let urlArray = [];

  const matches = [...url.matchAll(/(:([a-zA-Z0-9-_]+))/g)];
  matches.reduce((part, match) => {
    const before = part.substring(0, part.indexOf(match[0]));
    const after = part.substring(part.indexOf(match[0]) + match[0].length, part.length);
    urlArray.push(`${before}`, match[2]);
    if (match === matches[matches.length - 1]) {
      urlArray.push(after);
    }
    return after;
  }, url);

  if (matches.length === 0) {
    urlArray = [url];
  }

  const urlClosure = (params = {}) => (
    urlArray.map((urlPart) => (params[urlPart] || urlPart)).join('')
  );
  return urlClosure;
};

describe('entities/url', () => {
  it('should throw an error if the "url" argument is not a string', () => {
    expect(() => url(1)).toThrow();
  });
  it('should be a closure', () => {
    expect(url('http://ds9')).toBeInstanceOf(Function);
  });
  it('should properly compile the url without parameter', () => {
    expect(url('https://voyager.com/crew')()).toEqual('https://voyager.com/crew');
  });
  it('should properly compile the urls', () => {
    const tests = [{
      url: 'https://voyager.com/crew/:id',
      params: { id: 1 },
      result: 'https://voyager.com/crew/1',
    }, {
      url: 'https://voyager.com/crew/:id/:id2',
      params: { id: 1, id2: 2 },
      result: 'https://voyager.com/crew/1/2',
    }, {
      url: 'https://voyager.com/crew/:id/:id2/path/:id3',
      params: { id: 1, id2: 2, id3: 3 },
      result: 'https://voyager.com/crew/1/2/path/3',
    }, {
      url: 'https://voyager.com/crew/:id/:id2/path/:id3/end',
      params: { id: 1, id2: 2, id3: 3 },
      result: 'https://voyager.com/crew/1/2/path/3/end',
    }];
    tests.forEach((value) => {
      expect(url(value.url)(value.params)).toEqual(value.result);
    });
  });
});

// =================================================================================================
// SERVICE
// =================================================================================================

// { data: {  } , options }
const service = (name, baseUrl, { data = {}, options = {} } = {}) => {
  // validateType(name, 'string', 'Invalid argument: "name", must be a string');

  if (typeof name !== 'string') {
    throw new TypeError('Invalid argument: "name", must be a string');
  }
  if (typeof baseUrl !== 'string') {
    throw new TypeError('Invalid argument: "baseUrl", must be a string');
  }
  if (typeof data !== 'object') {
    throw new TypeError('Invalid option argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid option argument: "options", must be an object');
  }

  const actions = {};
  const service = (actionName) => {
    if (typeof actionName !== 'string') {
      throw new TypeError('Invalid argument: "actionName", must be a string');
    }
    return actions[actionName];
  };

  service.data = data;

  service.options = options;

  service.action = (name, method, path, { data = {}, options = {} } = {}) => {
    if (typeof name !== 'string') {
      throw new TypeError('Invalid argument: "name", must be a string');
    }
    if (typeof method !== 'string') {
      throw new TypeError('Invalid argument: "method", must be a string');
    }
    if (typeof path !== 'string') {
      throw new TypeError('Invalid argument: "path", must be a string');
    }
    if (typeof data !== 'object') {
      throw new TypeError('Invalid option argument: "data", must be an object');
    }
    if (typeof options !== 'object') {
      throw new TypeError('Invalid option argument: "options", must be an object');
    }
    actions[name] = {
      name,
      method,
      url: url(`${baseUrl}${path}`),
      service,
      data,
      options,
    };
  };

  service.toString = () => baseUrl;

  return service;
};

describe('entities/service', () => {
  it('should be a closure', () => {
    expect(service('DS9', 'https://ds9')).toBeInstanceOf(Function);
  });
  it('should throw an error if the "name" argument is not a string', () => {
    expect(() => service(1, 'https://ds9')).toThrow();
  });
  it('should throw an error if the "url" argument is not a string', () => {
    expect(() => service('DS9', 1)).toThrow();
  });
  it('should render the url when converted toString', () => {
    expect(service('DS9', 'https://ds9').toString()).toBe('https://ds9');
  });
  it('should get data from the third argument', () => {
    const testService = service('DS9', 'https://ds9', { data: { captain: 'Janeway' } });
    expect(testService.data.captain).toEqual('Janeway');
  });
  it('should throw an error if the third argument\'s data is not an object', () => {
    expect(() => service('DS9', 'https://ds9', { data: 1 })).toThrow();
  });
  it('should get options from the third argument', () => {
    const testService = service('DS9', 'https://ds9', { options: { timeout: 150 } });
    expect(testService.options.timeout).toEqual(150);
  });
  it('should throw an error if the third argument\'s options is not an object', () => {
    expect(() => service('DS9', 'https://ds9', { options: 1 })).toThrow();
  });
  describe('service.action()', () => {
    let testService;
    beforeEach(() => {
      testService = service('DS9', 'https://enterprise');
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
    it('should get data from the third argument', () => {
      testService.action('getCaptain', 'get', '/captain', { data: { name: 'Janeway' } });
      expect(testService('getCaptain').data.name).toEqual('Janeway');
    });
    it('should throw an error if the third argument\'s data is not an object', () => {
      expect(() => testService.action('getCaptain', 'get', '/captain', { data: 1 })).toThrow();
    });
    it('should get options from the third argument', () => {
      testService.action('getCaptain', 'get', '/captain', { options: { timeout: 150 } });
      expect(testService('getCaptain').options.timeout).toEqual(150);
    });
    it('should throw an error if the third argument\'s options is not an object', () => {
      expect(() => testService.action('getCaptain', 'get', '/captain', { options: 1 })).toThrow();
    });
  });
});

// =================================================================================================
// REQUEST
// =================================================================================================

const got = require('got');
const { merge } = require('lodash');

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
  return sendRequest(
    action.method,
    action.url,
    merge(
      action.service.data,
      action.data,
      data,
    ),
    options,
  );
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
    testService = service('Voyager', 'https://voyager');
    testService.action('callJaneway', 'get', '/janeway');
    testService.action('callSomeone', 'get', '/:name');
  });
  it('should return a Promise', async () => {
    nock('https://voyager').get('/janeway').reply(200, { response: 'Amomawe' });
    const testRequest = request('get', url('https://voyager/janeway'));
    expect(testRequest).toBeInstanceOf(Object);
    expect(testRequest.then).toBeInstanceOf(Function);
  });
  it('should throw an error if the first argument is neither a string nor an object', async () => {
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
    it('should properly do the request', async () => {
      nock('https://voyager')
        .get('/Tuvok')
        .reply(200, {
          response: 'We often fear what we don\'t understand. Our best defence is knowledge.',
        });
      const { statusCode, body } = await request(testService('callSomeone'), {
        params: {
          name: 'Tuvok',
        },
      });
      expect(statusCode).toEqual(200);
      expect(body).toEqual({
        response: 'We often fear what we don\'t understand. Our best defence is knowledge.',
      });
    });
    describe('Service and data options', () => {
      beforeEach(() => {
        testService = service('Voyager', 'https://voyager', {
          data: {
            headers: {
              authorization: 'Bearer TOKEN',
              'user-agent': 'Enterprise',
            },
          },
        });
        testService.action('callJaneway', 'get', '/janeway');
        testService.action('callTuvok', 'get', '/tuvok', {
          data: {
            headers: {
              'user-agent': 'Janeway',
            },
            body: {
              role: 'security',
            },
          },
        });
      });
      it('should properly use the service\'s data', async () => {
        nock('https://voyager')
          .matchHeader('authorization', 'Bearer TOKEN')
          .get('/janeway')
          .reply(200);
        const { statusCode } = await request(testService('callJaneway'));
        expect(statusCode).toEqual(200);
      });
      it.todo('should properly use the service\'s options');
      it('should properly use the service\'s action\'s data', async () => {
        nock('https://voyager')
          .matchHeader('authorization', 'Bearer TOKEN')
          .matchHeader('user-agent', 'Janeway')
          .get('/tuvok', {
            role: 'security',
          })
          .reply(200);
        const { statusCode } = await request(testService('callTuvok'));
        expect(statusCode).toEqual(200);
      });
      it.todo('should properly use the service\'s action\'s options');
      it('should properly use the service\'s action\'s data and the direct data', async () => {
        nock('https://voyager')
          .matchHeader('authorization', 'Bearer TOKEN')
          .matchHeader('user-agent', 'Janeway')
          .matchHeader('x-request-for', 'Dominion')
          .get('/tuvok', {
            role: 'security',
            race: 'vulcan',
          })
          .reply(200);
        const { statusCode } = await request(testService('callTuvok'), {
          headers: {
            'x-request-for': 'Dominion',
          },
          body: {
            race: 'vulcan',
          },
        });
        expect(statusCode).toEqual(200);
      });
      it.todo('should properly use the service\'s action\'s options and the direct data');
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
    it('should properly use the direct data options', async () => {
      nock('https://voyager')
        .matchHeader('authorization', 'Bearer TOKEN')
        .get('/janeway')
        .reply(200);
      const { statusCode } = await request('get', url('https://voyager/janeway'), {
        headers: {
          authorization: 'Bearer TOKEN',
        },
      });
      expect(statusCode).toEqual(200);
    });
  });
});
