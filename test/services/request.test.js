const nock = require('nock');
const service = require('../../entities/service');
const url = require('../../entities/url');
const request = require('../../services/request2');

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
