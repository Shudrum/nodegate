---
layout: documentation
title: Modifiers
---

# Modifiers

All modifiers can be accessed from the top level function of **nodegate** or by direclty import the
modifiers path:

```js
const nodegate = require('nodegate');
const { aggregate } = nodegate;

// or

const { aggregate } = require('nodegate/modifiers');
```

Here is the complete list of all the bundled modifiers:

 - [aggregate(method, url, [property])](#aggregatemethod-url-property)
 - [filter(properties)](#filterproperties)
 - [forwardedHost()](#forwardedhost)
 - [mergeBody(body)](#mergebodybody)
 - [waitFor(method, url, test)](#waitformethod-url-test)
 - [routeMatch(regex, pipeline)](#routematchregex-pipeline)
 - [statusCode(code)](#statuscodecode)

## aggregate(method, url, [property])

Execute a request with the content of the container and aggregate the result to it. If `property` is
set, the result will be aggregated to the defined property name on the container.

_Arguments_

| Argument | Type   | Description                                 |
| :------- | :----- | :------------------------------------------ |
| `method` | string | **Required.** Method of the request.        |
| `url`    | string | **Required.** URL to call.                  |
| `path`   | string | Path of the property to set the result.     |

_Example_

```js
const pipeline = [
  aggregate('get', 'https://api.github.com/users/shudrum'),
];
```

## filter(paths)

Filter the container's body to keep only the properties listed on the `properties` argument array.

_Arguments_

| Argument | Type           | Description                                        |
| :------- | :------------- | :------------------------------------------------- |
| `paths`  | `string|array` | **Required.** Paths or path to filter on the body. |

_Example_

```js
const pipeline = [
  filter(['firstname', 'lastname']),
];
```

## forwardedHost()

Add the the container headers the property `X-Forwarded-Host` with the value of the original request
header `host`.

_Example_

```js
const pipeline = [
  forwardedHost(),
];
```

## mergeBody(body)

Merge the body parameter to the container body.

_Arguments_

| Argument | Type     | Description                            |
| :------- | :------- | :------------------------------------- |
| `body`   | `object` | Object to merge to the body container. |

_Example_

```js
const pipeline = [
  mergeBody({ data: 'value' }),
];
```

## statusCode(code)

Set the status code of the response of the route. Note that another modifier called after this one
can modify the status code.

_Arguments_

| Argument | Type      | Description                  |
| :------- | :-------- | :--------------------------- |
| `code`   | `integer` | Status code of the response. |

_Example_

```js
const pipeline = [
  statusCode(201),
];
```

## routeMatch(regex, pipeline)

Execute the `pipeline` argument if the path of the current route match the regex.
Mainly usefull for the `beforeEach()` pipeline.

_Arguments_

| Argument   | Type    | Description                                            |
| :--------- | :------ | :----------------------------------------------------- |
| `regex`    | `regex` | Regular expression to test with the path of the route. |
| `pipeline` | `array` | Pipeline to execute if the path match.                 |

_Example_

```js
const pipeline = [
  routeMatch(/\/user/, [
    // pipeline
  ]),
];
```

## waitFor(method, url, test)

Execute a request until the `test` argument function returns `true`. The test function will receive
two arguments: A simplified response, and the container of the route.

_Arguments_

| Argument   | Type     | Description                                             |
| :--------- | :------- | :------------------------------------------------------ |
| `method`   | string   | Method of the request.                                  |
| `url`      | string   | URL to call.                                            |
| `test`     | function | Function to execute on each request to test the result. |

_Examples_

```js
const pipeline = [
  waitFor(
    'get',
    'https://api.github.com/users/shudrum',
    response => response.statusCode === 200,
  );
];
```

```js
const pipeline = [
  waitFor(
    'get',
    'https://api.github.com/users/shudrum',
    (response, body) => response.user.firstname === body.user.firstname,
  ),
];
```

_Default configuration_

```json
{
  "delay": 300,
  "tentatives": 10,
}
```