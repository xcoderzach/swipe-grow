var els = [].slice.call(document.querySelectorAll('.thing'))

function applyCss(els, rules) {
  var length = els.length

  for(rule in rules) {
    if(rules.hasOwnProperty(rule)) {
      for(var i = 0 ; i < length ; i++) {
        els[i].style[rule] = rules[rule]
      }
    }
  }
}

var height = window.innerHeight
var width = window.innerWidth

var initialScale = 0.25

var initialY = (height * initialScale)
var initialX = 0

els.forEach(function(el, index) {
  el.style.width = (width - 4) + 'px'
  el.style.height = height + 'px'
})

function doLayout(xOffset, scale) {
  for(var i = 0 ; i < els.length ; i++) {
    els[i].style.webkitTransform = "translate3d(" + (xOffset + width * scale * i + 2) +  "px, 0, 0) scale(" + scale + ")"
  }
}
 setTimeout(function() {
   doLayout(0, initialScale)
 }, 16)

module.exports = doLayout