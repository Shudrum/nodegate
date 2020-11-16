/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const got = require('got');
const { merge } = require('lodash');

const sendRequest = (method, url, data /* , options */) => (
  got[method.toLowerCase()](url(data.params || {}), {
    headers: data.headers || {},
    json: data.body || {},
    allowGetBody: true,
    responseType: 'json',
  })
);

const doServiceRequest = (action, data = {}, options = {}) => {
  if (typeof data !== 'object') {
    throw new TypeError('Invalid argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid argument: "options", must be an object');
  }
  return sendRequest(
    action.method,
    action.url,
    merge(
      action.service.data,
      action.data,
      data,
    ),
    options,
  );
};

const doDirectRequest = (method, url, data = {}, options = {}) => {
  if (typeof url !== 'function') {
    throw new TypeError('Invalid argument: "url", must be a function');
  }
  if (typeof data !== 'object') {
    throw new TypeError('Invalid argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid argument: "options", must be an object');
  }
  return sendRequest(method, url, data, options);
};

module.exports = (...args) => {
  if (typeof args[0] === 'object') {
    return doServiceRequest(...args);
  }
  if (typeof args[0] === 'string') {
    return doDirectRequest(...args);
  }
  throw new TypeError('Invalid arguments');
};
