const nock = require('nock');
const { configure } = require('../../services/configuration');
const waitFor = require('../../workers/waitFor');
const { getEmpty } = require('../../entities/container');

describe('workers/waitFor', () => {
  beforeEach(() => {
    configure({ workers: { waitFor: { delay: 50, tentatives: 1 } } });
  });
  it('should return a function', () => {
    expect(waitFor('get', 'https://ds9', () => {})).toBeInstanceOf(Function);
  });
  it('should mutate the container', async () => {
    const container = getEmpty();
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    await waitFor('post', 'https://wiki.federation.com/armaments', () => true)(container);
    expect(container.body).toBeTruthy();
  });
  it('should aggregate the response to the container', async () => {
    const container = { body: { phasers: 2 } };
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    await waitFor('post', 'https://wiki.federation.com/armaments', () => true)(container);
    expect(container.body.phasers).toEqual(16);
  });
  it('should correclty test the response for a success', async () => {
    const container = getEmpty();
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ body }) => body.phasers === 16,
    )(container);
  });
  it('should correclty retry if there is an error', async () => {
    const container = getEmpty();
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 17 });
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ body }) => body.phasers === 17,
    )(container);
  });
  it('should correclty wait between tries', async () => {
    const startTime = new Date().getTime();
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 17 });
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ body }) => body.phasers === 17,
    )({});
    const elapsedTime = new Date().getTime() - startTime;
    expect(elapsedTime).toBeGreaterThanOrEqual(50);
  });
  it('should throw an error after the second fail', async () => {
    expect.assertions(1);
    try {
      nock('https://wiki.federation.com')
        .post('/armaments')
        .times(2)
        .reply(200, { phasers: 16 });
      await waitFor(
        'post',
        'https://wiki.federation.com/armaments',
        ({ body }) => body.phasers === 17,
      )({});
    } catch (err) {
      expect(err.message).toEqual('Wait for https://wiki.federation.com/armaments failed');
    }
  });
  it('should pass the status code to the test', async () => {
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(202);
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ statusCode }) => statusCode === 202,
    )({});
  });
  it('should pass the container to the test', async () => {
    const container = getEmpty();
    container.body.phasers = 8;
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ body }, container) => body.phasers > container.body.phasers,
    )(container);
    expect(container.body.phasers).toEqual(16);
  });
  it('should not aggregate the response if the option is set to false', async () => {
    const container = getEmpty();
    container.body.phasers = 8;
    nock('https://wiki.federation.com')
      .post('/armaments')
      .reply(200, { phasers: 16 });
    await waitFor(
      'post',
      'https://wiki.federation.com/armaments',
      ({ body }) => body.phasers > 1,
      { aggregate: false },
    )(container);
    expect(container.body.phasers).toEqual(8);
  });
});
