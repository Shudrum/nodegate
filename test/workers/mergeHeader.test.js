const mergeHeaders = require('../../workers/mergeHeaders');

describe('workers/mergeHeaders', () => {
  it('should correctly return a function', () => {
    expect(mergeHeaders()).toBeInstanceOf(Function);
  });
  it('should return the container with the merged header', () => {
    const container = { headers: { } };
    mergeHeaders({ 'Cache-Control': 'no-cache' })(container);
    expect(container).toEqual({
      headers: { 'Cache-Control': 'no-cache' },
    });
  });
  it('should not remove existing attributes', () => {
    const container = { headers: { 'Content-Language': 'fr-FR' } };
    mergeHeaders({ 'Cache-Control': 'no-cache' })(container);
    expect(container).toEqual({
      headers: { 'Content-Language': 'fr-FR', 'Cache-Control': 'no-cache' },
    });
  });
});
