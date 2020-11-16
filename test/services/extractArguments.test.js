const extractArguments = require('../../services/extractArguments');

describe('services/extractArguments', () => {
  it('should validate a simple signature of one argument', () => {
    const { param } = extractArguments('methodName', { param: 'string' })('hello');
    expect(param).toEqual('hello');
  });
  it('should validate a simple signature of two arguments', () => {
    const { param, option } = extractArguments(
      'methodName',
      { param: 'string', option: 'object' },
    )('hello', {});
    expect(param).toEqual('hello');
    expect(option).toEqual({});
  });
  it('should validate the right signature', () => {
    const validator = extractArguments(
      'methodName',
      [{ action: 'string', name: 'string' }, { param: 'string', count: 'number' }],
    );
    const { param, count } = validator('hello', 3);
    expect(param).toEqual('hello');
    expect(count).toEqual(3);
    const { action, name } = validator('hello', 'Spock');
    expect(action).toEqual('hello');
    expect(name).toEqual('Spock');
  });
  it('should accept one optional parameter', () => {
    const validator = extractArguments(
      'methodName',
      { param: 'string', options: 'object?' },
    );
    const { param, options } = validator('hello', {});
    expect(param).toEqual('hello');
    expect(options).toEqual({});
    expect(validator('hello')).toEqual({ param: 'hello' });
  });
  it('should correctly match two optional parameters', () => {
    const validator = extractArguments(
      'methodName',
      { url: 'string', data: 'function?', options: 'object?' },
    );
    const data = () => {};
    const options = {};
    expect(validator('https://voyager')).toEqual({ url: 'https://voyager' });
    expect(validator('https://voyager', data)).toEqual({ url: 'https://voyager', data });
    expect(validator('https://voyager', options)).toEqual({ url: 'https://voyager', options });
    expect(validator('https://voyager', data, options)).toEqual({ url: 'https://voyager', data, options });
  });
  it('should validate and set default values', () => {
    const validator = extractArguments(
      'methodName',
      { url: 'string', data: 'object?' },
      { data: { captain: 'Janeway' } },
    );
    expect(validator('https://voyager')).toEqual({ url: 'https://voyager', data: { captain: 'Janeway' } });
  });
  it('should throw an error in case of wrong argument', () => {
    expect.assertions(1);
    try {
      extractArguments('methodName', { url: 'string' })(1);
    } catch (err) {
      expect(err.message).toEqual(
        'Invalid call to \'methodName\'\n\n'
        + 'Faulty call: methodName(number)\n\n'
        + 'The correct usages are:\n'
        + '  methodName(url:string)\n',
      );
    }
  });
  it('should throw an error if an argument is missing', () => {
    expect.assertions(1);
    try {
      extractArguments('methodName', { param: 'string', data: 'function' })('hello');
    } catch (err) {
      expect(err.message).toEqual(
        'Invalid call to \'methodName\'\n\n'
        + 'Faulty call: methodName(string)\n\n'
        + 'The correct usages are:\n'
        + '  methodName(param:string, data:function)\n',
      );
    }
  });
  it('should throw an error in case of wrong arguments with several signatures', () => {
    expect.assertions(1);
    try {
      extractArguments('methodName', [
        { url: 'string' },
        {
          method: 'string', url: 'string', data: 'function?', options: 'object?',
        },
      ])('get', 'https://voyager', 'Janeway');
    } catch (err) {
      expect(err.message).toEqual(
        'Invalid call to \'methodName\'\n\n'
        + 'Faulty call: methodName(string, string, string)\n\n'
        + 'The correct usages are:\n'
        + '  methodName(url:string)\n'
        + '  methodName(method:string, url:string, data:function?, options:object?)\n',
      );
    }
  });
  it('should throw an error if optional parameters are not at the end', () => {
    expect.assertions(1);
    try {
      extractArguments('methodName', { url: 'string', data: 'string?', method: 'string' });
    } catch (err) {
      expect(err.message).toEqual(
        'Optional parameters must be declared at the end.',
      );
    }
  });
  it('should throw an error if there are several optional parameters of the same type', () => {
    expect.assertions(1);
    try {
      extractArguments('methodName', { url: 'string', data: 'string?', method: 'string?' });
    } catch (err) {
      expect(err.message).toEqual(
        'You cannot declare two or more optional parameters of the same type:\n'
        + '  \'data\' and \'method\' are of type \'string?\'\n',
      );
    }
  });
});
