


// Est-ce que les services doivent avoir des noms ? (Debug)
const myService = createService('https://github.com/api');
const myService = createService(URL_SERVICE_GITHUB);

const myService = createService('github', URL_SERVICE_GITHUB); // Avec nom


myService.setHeaders({
  authorization: 'Bearer AEZREYTGUDFHDFSUGJH',
  'x-forwarded-for': 'someone',
});


// Pas fan de "addAction"
myService.path('actionA', {
  method: 'get',
  path: '/users/:id',
});

// 1: Service data
// 2: merge Route data
// 3: merge Call data


aggregate(myService.actionA, ({ body }) => ({
  params: {
    id: body.id,
  }
  body,
}));

// Workers: aggregate / waitFor

aggregate -> request -> (package)request




// toString
const myService = createService('https://github.com/api');
console.log(myService.toString()) // https://github.com/api
aggregate('get', `${myService}/coucou`) // https://github.com/api/coucou

// Aggregate signature
aggregate('string', 'string', 'function') // Direct call
aggregate('object', 'function') // Call to a service path
aggregate('string', 'string') // Direct call with all container <- Params issue
aggregate('object') // Call to a service path with all container <- Params issue
// Todo: Catcher le manque de params si nécessaire en amont (possible au start)































