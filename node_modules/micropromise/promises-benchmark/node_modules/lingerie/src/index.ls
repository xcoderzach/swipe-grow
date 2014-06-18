## Module lingerie
#
# Sexy and fashionable string manipulation in JavaScript.
#
# 
# Copyright (c) 2013 Quildreen "Sorella" Motta <quildreen@gmail.com>
# 
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation files
# (the "Software"), to deal in the Software without restriction,
# including without limitation the rights to use, copy, modify, merge,
# publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



### -- Building --------------------------------------------------------

#### λ repeat
# Creates a `String` by repeating the given one a number of `times`.
#
# :: Number -> String -> String
repeat = (times, text) -->
  | times <= 0 => ''
  | otherwise  => (Array times + 1).join text


#### λ concatenate
# Creates a `String` by concatenating all the given ones together.
#
# :: String... -> String
concatenate = (...xs) -> ''.concat ...xs



### -- Manipulating ----------------------------------------------------

#### λ trim
# Removes whitespace from both ends of the `String`.
#
# :: String -> String
trim = (text) -> text.trim!


#### λ trim-left
# Removes whitespace from the beginning of the `String`.
#
# :: String -> String
trim-left = (text) -> text.replace /^\s+/, ''


#### λ trim-right
# Removes whitespace from the end of the `String`.
#
# :: String -> String
trim-right = (text) -> text.replace /\s+$/, ''



### -- Predicates ------------------------------------------------------

#### λ starts-with
# Does the `String` start with a given piece of text?
#
# :: String -> String -> Bool
starts-with = (what, text) --> (text.slice 0, what.length) is what


#### λ ends-with
# Does the `String` end with a given piece of text?
#
# :: String -> String -> Bool
ends-with = (what, text) --> (text.slice -what.length) is what


#### λ is-empty
# Is the `String` empty?
#
# :: String -> Bool
is-empty = (text) -> text is ''


#### λ has
# Does the `String` contain a given piece of text?
#
# :: String -> String -> Bool
has = (what, text) --> (text.index-of what) isnt -1



### -- Case folding ----------------------------------------------------

#### λ upcase
# Returns a new version of the `String`, with upper-cased characters.
#
# :: String -> String
upcase = (.to-upper-case!)


#### λ downcase
# Returns a new version of the `String`, with lower-cased characters.
#
# :: String -> String
downcase = (.to-lower-case!)


#### λ capitalise-with
# :internal:
# Capitalises the `String` using the given RegExp.
#
# :: String -> String
capitalise-with = (re, text) --> (downcase text).replace re, upcase


#### λ capitalise
# Returns a new version of the `String`, with the first letter
# upper-cased and the rest lower-cased.
#
# :: String -> String
capitalise = capitalise-with /\b\w/


#### λ capitalise-words
# Returns a new version of the `String`, with every first letter for
# every word upper-cased and the rest of the text lower-cased.
#
# :: String -> String
capitalise-words = capitalise-with /\b\w/g


#### λ dasherise
# Returns a new version of the `String`, with all words separated only
# by dashes
#
# All of the whitespace is stripped in the process.
#
# :: String -> String
dasherise = (text) -> text.trim!.replace /\s+/g, '-'


#### λ camelise
# Returns a new version of the `String` with all the whitespace and
# hyphens stripped, the first letter of each word upper-cased and the
# rest of the letters lower-cased.
#
# All of the whitespace is stripped in the process.
#
# :: String -> string
camelise = (text) ->
  boundary = /[\s\-_]+(\w)/g

  (downcase text.trim!) .replace boundary, (_, letter) -> upcase letter



### -- Slicing ---------------------------------------------------------

#### λ first
# Returns the first character in the `String`.
#
# :: String -> Char
first = (text) -> text.char-at 0


#### λ rest
# Returns a new `String` with all but the first characters.
#
# :: String -> String
rest = (text) -> text.slice 1


#### λ last
# Returns the last character in the `String`
#
# :: String -> Char
last = (text) -> text.char-at (text.length - 1)


#### λ but-last
# Returns a new `String` with all but the last character.
#
# :: String -> String
but-last = (text) -> text.slice 0, -1


#### λ take
# Returns a new `String`, from the first character up to the given
# `size`.
#
# :: Number -> String -> String
take = (size, text) --> text.slice 0, size


#### λ drop
# Returns a new `String` without the N first characters.
#
# :: Number -> String -> String
drop = (size, text) --> text.slice size


#### λ slice
# Returns a new `String` containing the part of the original sequence
# from `[start, end[`.
#
# If either `start` or `end` are given negative indexes, the number is
# taken to be an offset from the end of the sequence.
#
# :: Number -> Number -> String -> String
slice = (start, end, text) --> text.slice start, end




### -- Exports ---------------------------------------------------------
module.exports = {
  repeat, concatenate

  trim, trim-left, trim-right
  
  starts-with, ends-with, is-empty, has

  upcase, downcase, capitalise, capitalise-words, dasherise, camelise

  first, rest, last, but-last, take, drop, slice
}
