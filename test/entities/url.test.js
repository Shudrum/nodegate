const url = require('../../entities/url');

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
