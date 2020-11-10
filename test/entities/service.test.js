const service = require('../../entities/service');

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
  it('should throw an error if the closure is called with a wrong argument', () => {
    const testService = service('DS9', 'https://ds9', { options: { timeout: 150 } });
    expect(() => testService(1)).toThrow();
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
