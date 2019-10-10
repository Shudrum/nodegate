/**
 * Copyright (c) Weekendesk SAS.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = (workflows) => async (container, request, execute) => {
  const executedWorkflows = [];
  workflows.forEach((workflow) => {
    executedWorkflows.push(execute(
      typeof workflow === 'function' ? [workflow] : workflow,
      container,
      request,
    ));
  });
  await Promise.all(executedWorkflows);
};
