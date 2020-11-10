/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const url = require('./url');

module.exports = (name, baseUrl, { data = {}, options = {} } = {}) => {
  if (typeof name !== 'string') {
    throw new TypeError('Invalid argument: "name", must be a string');
  }
  if (typeof baseUrl !== 'string') {
    throw new TypeError('Invalid argument: "baseUrl", must be a string');
  }
  if (typeof data !== 'object') {
    throw new TypeError('Invalid option argument: "data", must be an object');
  }
  if (typeof options !== 'object') {
    throw new TypeError('Invalid option argument: "options", must be an object');
  }

  const actions = {};
  const service = (actionName) => {
    if (typeof actionName !== 'string') {
      throw new TypeError('Invalid argument: "actionName", must be a string');
    }
    return actions[actionName];
  };

  service.data = data;

  service.options = options;

  // eslint-disable-next-line no-shadow
  service.action = (name, method, path, { data = {}, options = {} } = {}) => {
    if (typeof name !== 'string') {
      throw new TypeError('Invalid argument: "name", must be a string');
    }
    if (typeof method !== 'string') {
      throw new TypeError('Invalid argument: "method", must be a string');
    }
    if (typeof path !== 'string') {
      throw new TypeError('Invalid argument: "path", must be a string');
    }
    if (typeof data !== 'object') {
      throw new TypeError('Invalid option argument: "data", must be an object');
    }
    if (typeof options !== 'object') {
      throw new TypeError('Invalid option argument: "options", must be an object');
    }
    actions[name] = {
      name,
      method,
      url: url(`${baseUrl}${path}`),
      service,
      data,
      options,
    };
  };

  service.toString = () => baseUrl;

  return service;
};
