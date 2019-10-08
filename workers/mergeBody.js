/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { cloneDeep, merge } = require('lodash');

module.exports = (body) => (container) => ({
  ...cloneDeep(container),
  body: merge(container.body, body),
});