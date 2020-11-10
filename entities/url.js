/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = (url) => {
  if (typeof url !== 'string') {
    throw new TypeError('Invalid argument: "url", must be a string');
  }

  let urlArray = [];

  const matches = [...url.matchAll(/(:([a-zA-Z0-9-_]+))/g)];
  matches.reduce((part, match) => {
    const before = part.substring(0, part.indexOf(match[0]));
    const after = part.substring(part.indexOf(match[0]) + match[0].length, part.length);
    urlArray.push(`${before}`, match[2]);
    if (match === matches[matches.length - 1]) {
      urlArray.push(after);
    }
    return after;
  }, url);

  if (matches.length === 0) {
    urlArray = [url];
  }

  const urlClosure = (params = {}) => (
    urlArray.map((urlPart) => (params[urlPart] || urlPart)).join('')
  );
  return urlClosure;
};
