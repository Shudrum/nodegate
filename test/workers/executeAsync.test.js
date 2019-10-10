const executeAsync = require('../../workers/executeAsync');

const execute = jest.fn();

describe('workers/executeAsync', () => {
  beforeEach(() => {
    execute.mockClear();
  });
  it('should correctly return a function', () => {
    expect(executeAsync()).toBeInstanceOf(Function);
  });
  it('should execute the workflows', () => {
    executeAsync([[() => {}], [() => {}]])({}, {}, execute);
    expect(execute.mock.calls.length).toBe(2);
  });
  it('should automatically convert single workers into workflows', () => {
    executeAsync([() => {}, () => {}])({}, {}, execute);
    expect(execute.mock.calls[0][0]).toBeInstanceOf(Array);
    expect(execute.mock.calls[1][0]).toBeInstanceOf(Array);
  });
});
