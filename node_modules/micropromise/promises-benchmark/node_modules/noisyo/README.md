# Noisyo [![Build Status](https://travis-ci.org/killdream/noisyo.png)](https://travis-ci.org/killdream/noisyo) ![Dependencies Status](https://david-dm.org/killdream/noisyo.png)

**Note that this only works in Node 0.10 now, using the new Streams.**

Drinks and vomits Stream contents. Promised to be really noisy.

As you could probably guess, this is totes influenced by the [Clojure core
library](http://clojuredocs.org/clojure_core/clojure.core/slurp). But more
general :D


## Example

```js
var noisyo = require('noisyo')
var spit   = noisyo.spit
var slurp  = noisyo.slurp

// Slurp takes a Stream and returns a Promise of its contents.
// Spit takes a Stream, and some contents, and returns a Promise of the
// eventual draining.
spit(process.stdout, slurp(process.stdin))

// So, why not just `.pipe()` you faggot?
// Well, these work with both Strings and Streams interchangeably.
var input = slurp(process.stdin)
input.then(function(data) {
  console.log(data)
  spit(fs.createWriteStream('foo.txt'), data)
})

// Obviously, you *will* want to use Streams directly if you're interested in
// piping between them, this is not a substitute for Streams, just a nice,
// high-level way of getting to its contents in one-shot quickly and
// asynchronously. But it will buffer the whole thing in memory, which might be
// *bad* in certain cases.
```


## Installing

Just grab it from NPM:

    $ npm install noisyo


## Documentation

A quick reference of the API can be built using [Calliope][]:

    $ npm install -g calliope
    $ calliope build


## Tests

You can run all tests using Mocha:

    $ npm test


## Licence

MIT/X11. ie.: do whatever you want.

[Calliope]: https://github.com/killdream/calliope
[es5-shim]: https://github.com/kriskowal/es5-shim
