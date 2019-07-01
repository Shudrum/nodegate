---
layout: documentation
title: Gateway
---

# Gateway

The `gateway` is by convention, the resulting object when calling the top level `nodegate()`
function. It contains the methods you need to configure and start your gateway.

```js
const nodegate = require('nodegate');
const gateway = nodegate();

gateway.route({
  method: 'get',
  path: '/gateway-route',
  pipeline: [...],
});

gateway.listen(8080);
```

## Methods

### route(route)

Add one or more route to the gateway.

```js
gateway.route({
  method: 'get',
  path: '/gateway-route',
  pipeline: [...],
});
```

_Arguments_

| Argument | Type                   | Description                                     |
| :------- | :--------------------- | :---------------------------------------------- |
| `route`  | `object` or `[object]` | Route or array of routes to add to the gateway. |

### beforeEach(modifier)

Add one or more modifier to execute before each request.

```js
gateway.beforeEach(forwardedHost());

// or

gateway.beforeEach([
  forwardedHost(),
  aggregate('get', 'https://api.github.com/users/shudrum'),
]);
```

_Arguments_

| Argument   | Type                       | Description                                                    |
| :--------- | :------------------------- | :------------------------------------------------------------- |
| `modifier` | `function` or `[function]` | Modifier or array of modifiers to execute before all requests. |