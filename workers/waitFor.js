/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { assign } = require('lodash');
const WorkflowError = require('../entities/WorkflowError');
const toUrl = require('../entities/url');
const { getConfiguration } = require('../services/configuration');
const extractArguments = require('../services/extractArguments');
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

const timeout = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const tryRequest = async (
  container, data, action, method, url, test, configuration, tentatives = 0,
) => {
  let response;
  if (action) {
    response = await request(action, data(container));
  } else {
    response = await request(method, url, data(container));
  }
  const { statusCode, headers, body } = response;
  if (!test({ statusCode, headers, body }, container)) {
    if (tentatives < configuration.tentatives) {
      await timeout(configuration.delay);
      return tryRequest(container, data, action, method, url, test, configuration, tentatives + 1);
    }
    throw new Error(`Wait for ${url(container)} failed`);
  }
  return Promise.resolve(response);
};

module.exports = (...args) => {
  let {
    action, method, url, data, options, test,
  } = extractArguments(
    'waitFor',
    [{
      action: 'object', test: 'function', data: 'function?', options: 'object?',
    }, {
      method: 'string', url: 'function', test: 'function', data: 'function?', options: 'object?',
    }, {
      method: 'string', url: 'string', test: 'function', data: 'function?', options: 'object?',
    }],
    {
      data: (container) => container,
      options: {},
    },
  )(...args);

  if (typeof url === 'string') {
    url = toUrl(url);
  }

  options = {
    aggregate: true,
    ...options,
  };

  const configuration = getConfiguration().workers.waitFor;

  const failStatusCodes = options.failStatusCodes || [400, 500];
  return async (container) => {
    try {
      const response = await tryRequest(container, data, action, method, url, test, configuration);
      container.statusCode = response.statusCode;
      if (options.aggregate) {
        setBodyToContainer(response.body, container, options);
      }
    } catch (err) {
      const body = err.response && err.response.body;
      const statusCode = err.response ? err.response.statusCode : 500;

      if (body && !failStatusCodes.includes(parseInt(`${`${statusCode}[0]`}00`, 10))) {
        if (options.aggregate) {
          setBodyToContainer(body, container, options);
        }
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
