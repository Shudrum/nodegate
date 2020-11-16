/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { assign } = require('lodash');
const WorkflowError = require('../entities/WorkflowError');
const extractArguments = require('../services/extractArguments');
const toUrl = require('../entities/url');
const request = require('../services/request');

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

module.exports = (...args) => {
  let {
    action, method, url, data, options,
  } = extractArguments(
    'aggregate',
    [
      { action: 'object', data: 'function?', options: 'object?' },
      {
        method: 'string', url: 'function', data: 'function?', options: 'object?',
      }, {
        method: 'string', url: 'string', data: 'function?', options: 'object?',
      },
    ],
    {
      data: (container) => container,
      options: {},
    },
  )(...args);

  if (typeof url === 'string') {
    url = toUrl(url);
  }

  const failStatusCodes = options.failStatusCodes || [400, 500];
  return async (container) => {
    try {
      let response;
      if (action) {
        response = await request(action, data(container), options);
      } else {
        response = await request(method, url, data(container));
      }
      container.statusCode = response.statusCode;
      setBodyToContainer(response.body, container, options);
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
