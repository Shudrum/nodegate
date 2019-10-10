const nock = require('nock');
const request = require('supertest');
const nodegate = require('../../services/nodegate');
const { aggregate, executeAsync } = require('../../workers');

const waitWorker = () => new Promise((resolve) => setTimeout(resolve, 500));

describe('scenarios/asynchronousWorkflows', () => {
  let gate;
  beforeEach(() => {
    gate = nodegate();
    gate.route({
      method: 'get',
      path: '/captains/:name',
      workflow: [
        executeAsync([[
          waitWorker,
          aggregate('get', 'https://federation.com/captains/{params.name}', 'captain'),
        ], [
          waitWorker,
          aggregate('get', 'https://federation.com/ships/{params.name}', 'ships'),
        ]]),
      ],
    });
    nock('https://federation.com')
      .get('/captains/picard')
      .reply(200, { completeName: 'Jean Luc Picard' });
    nock('https://federation.com')
      .get('/ships/picard')
      .reply(200, ['NCC-1701 Enterprise', 'NCC-1702 Enterprise']);
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('should respond in less than 1.5 seconds', async () => {
    const startTime = Date.now();
    await request(gate)
      .get('/captains/picard')
      .expect(200)
      .then(({ body }) => {
        expect(body.captain.completeName).toEqual('Jean Luc Picard');
        expect(body.ships).toBeInstanceOf(Array);
        expect(Date.now() - startTime).toBeLessThan(600);
      });
  });
});
