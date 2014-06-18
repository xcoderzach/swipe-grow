# Lingerie [![Build Status](https://travis-ci.org/killdream/lingerie.png)](https://travis-ci.org/killdream/lingerie)

Sexy and fashionable string manipulation in JavaScript.


### Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :3

[![browser support](http://ci.testling.com/killdream/lingerie.png)](http://ci.testling.com/killdream/lingerie)


### Example

```js
var l = require('lingerie')

l.isEmpty('foo')
// => (Boolean) false

// Most functions are curried though, so take advantage of it:
var fooStuff = l.startsWith('foo')
fooStuff('fooBar')
// => (Boolean) true
```


### Installing

Just grab it from NPM:

    $ npm install lingerie


### Documentation

A quick reference of the API can be built using [Calliope][]:

    $ npm install -g calliope
    $ calliope build


### Tests

You can run all tests using Mocha:

    $ npm test


### Licence

MIT/X11. ie.: do whatever you want.

[Calliope]: https://github.com/killdream/calliope
[es5-shim]: https://github.com/kriskowal/es5-shim
