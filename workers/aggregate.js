/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { assign } = require('lodash');
const WorkflowError = require('../entities/WorkflowError');
const request = require('../services/request2');
const url = require('../entities/url');

const setBodyToContainer = (body, container, options) => {
  if (!options.path && typeof body !== 'object') {
    return;
  }
  if (options.path && !container.body[options.path]) {
    container.body[options.path] = body;
    return;
  }
  if (options.path) {
    assign(container.body[options.path], body);
    return;
  }
  assign(container.body, body);
};

// url();
// method url => url();

// aggregate(service(action), {})
// aggregate('get', url('blabla'), {})
// aggregate('get',        'https://ds9/crewmember/:id', (container) => ({ params : { id: 'janeway'}}), { options });
// aggregate(/* method */, /* url */,                    /* data */,                                   /* options */);
// path: toto => container.body.toto
//

// module.exports = (method, url, data = () => {}, options = {}) => {
module.exports = (...args) => {
  if (typeof args[0] === 'string') {
    if (typeof args[1] === 'string') {
      args[1] = url(args[1]);
    }
    /* method , url() , data , options */
  }
  const method = args[0];
  const builtUrl = args[1];
  const data = args[2] || (() => {});
  const options = args[3] || {};
  const failStatusCodes = options.failStatusCodes || [400, 500];
  return async (container) => {
    try {
      const { body, statusCode } = await request(
        method,
        builtUrl,
        data(container),
      );
      container.statusCode = statusCode;
      setBodyToContainer(body, container, options);
    } catch (err) {
      const body = err.response && err.response.body;
      const statusCode = err.response ? err.response.statusCode : 500;

      if (body && !failStatusCodes.includes(parseInt(`${`${statusCode}[0]`}00`, 10))) {
        setBodyToContainer(body, container, options);
        container.statusCode = statusCode;
        return;
      }

      const error = new WorkflowError(err, err.response);
      error.setContainer(container);
      if (body) {
        container.errorBody = body;
      }
      container.statusCode = statusCode;

      throw error;
    }
  };
};
