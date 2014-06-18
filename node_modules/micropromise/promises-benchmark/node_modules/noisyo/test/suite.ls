stream = require 'stream'
{slurp, spit} = require '../lib'

(require 'mocha-as-promised')!
chai = require 'chai'
chai.use (require 'chai-as-promised')
{expect} = chai

o = it
x = xit

duplex = ->
  d = new stream.Duplex
  d.name = '<no>'
  data = ''
  d._write = (buf, enc, f) ->
                  data := buf.to-string!
                  d.push data
                  process.next-tick -> do
                                       d.push null
                                       if f => f!

  d._read = (n) -> do
                   if d.haz-error => d.emit 'error', (new Error 'no u')
                   data

  return d

d = null
before-each ->
  d := duplex!
  d.name = '<d>'

text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'


describe 'λ slurp' ->
  o 'Should fulfill with the full contents of the stream.' ->
     d.write text
     expect (slurp d) .to.become text


describe 'λ spit' ->
  describe 'with Stream' ->
    o 'Should fulfill after contents have been piped.' (done) ->
       t = duplex!
       d.write text
       expect (slurp (spit t, d)) .to.become text

    o 'Should fulfill after source is read if it\'s a standard output stream.' ->
       d.write text
       expect (spit process.stdout, d) .to.be.fulfilled

  describe 'with Strings' ->
    o 'Should fulfill after writing to the source.' ->
       expect (slurp (spit d, text)) .to.become text

       
