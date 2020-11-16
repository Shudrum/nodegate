/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const buildDictionary = (signaturesTree, signature) => {
  const paramNames = [];
  const rootTree = signaturesTree;
  Object.entries(signature).forEach(([paramName, paramType]) => {
    if (paramType.slice(-1) === '?') {
      const altSignature = { ...signature };
      delete altSignature[paramName];
      buildDictionary(rootTree, altSignature);
      paramType = paramType.slice(0, -1);
    }
    if (!signaturesTree[paramType]) {
      signaturesTree[paramType] = {};
    }
    paramNames.push(paramName);
    signaturesTree = signaturesTree[paramType];
  });
  signaturesTree.resolve = paramNames;
};

const validate = (signature) => {
  let lastOptionalType;
  const optionalTypes = {};
  Object.entries(signature).forEach(([paramName, paramType]) => {
    if (paramType.slice(-1) === '?') {
      if (optionalTypes[paramType]) {
        throw new TypeError(
          'You cannot declare two or more optional parameters of the same type:\n'
          + `  '${optionalTypes[paramType]}' and '${paramName}' are of type '${paramType}'\n`,
        );
      }
      optionalTypes[paramType] = paramName;
      lastOptionalType = paramType;
    } else if (lastOptionalType) {
      throw new TypeError('Optional parameters must be declared at the end.');
    }
  });
};

const throwFaultyCallError = (methodName, signatures, args) => {
  const logSignatures = signatures.map(
    (signature) => `  ${methodName}(${Object.entries(signature)
      .map(([name, type]) => `${name}:${type}`)
      .join(', ')
    })`,
  ).join('\n');

  throw new TypeError(
    `Invalid call to '${methodName}'\n\n`
    + `Faulty call: ${methodName}(${args.map((currentArg) => (typeof currentArg)).join(', ')})\n\n`
    + `The correct usages are:\n${logSignatures}\n`,
  );
};

module.exports = (methodName, signatures, defaults = {}) => {
  if (!Array.isArray(signatures)) signatures = [signatures];
  const signaturesTree = {};
  signatures.forEach((signature) => {
    validate(signature);
    buildDictionary(signaturesTree, signature);
  });
  return (...args) => {
    const result = { ...defaults };
    let currentTree = signaturesTree;
    args.forEach((arg) => {
      currentTree = currentTree[typeof arg];
      if (!currentTree) throwFaultyCallError(methodName, signatures, args);
    });
    const paramNames = currentTree.resolve;
    if (!paramNames) throwFaultyCallError(methodName, signatures, args);
    for (let index = 0; index < args.length; index += 1) {
      result[paramNames[index]] = args[index];
    }
    return result;
  };
};
