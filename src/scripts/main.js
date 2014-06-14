var physics = require('rk4')
  , els = [].slice.call(document.querySelectorAll('.thing'))
  , phys = physics(document.body)
  , Vector = require('rk4/lib/vector')
  , Velocity = require('touch-velocity')
  , mousedown = false
  , veloX
  , veloY
  , layout = require('./layout')
  , height = window.innerHeight
  , width = window.innerWidth
  , initialScale = 0.25
  , initialY = height * initialScale
  , initialX = 0
  , lastX = 0
  , lastY = 0
  , lastScale = .25


function page(axis, evt) {
  axis = axis.toUpperCase()
  return (evt.touches && evt.touches[0]['page' + axis]) || evt['page' + axis]
}

phys.css(function(position) {
  lastY = position.y
  lastX = position.x

  var scale = lastScale = scaleFromY(position.y)
  layout(position.x, 0.25)//scale)
  return {}
})

var fingerOffsetX, fingerOffsetY
  , chosenIndex

var touchEnabled = 'ontouchstart' in document.body
var startEvent = touchEnabled ? 'touchstart' : 'mousedown'
var endEvent = touchEnabled ? 'touchend' : 'mouseup'
var moveEvent = touchEnabled ? 'touchmove' : 'mousemove'

var scaleOffset

window.addEventListener(startEvent, function(evt) {
  phys.cancel()
  mousedown = true
  veloX = new Velocity()
  veloY = new Velocity()

  fingerOffsetX = page('x', evt) - lastX
  fingerOffsetY = page('y', evt) - lastY
  scaleOffset = lastScale

  var target = evt.target
  for(var i = 0 ; (target = target.previousSibling) != null ; target.nodeType === 1 && i++) {}
  chosenIndex = i
})

window.addEventListener(endEvent, function(evt) {
  mousedown = false

  var vel = Vector(veloX.getVelocity() || 0, veloY.getVelocity() || 0)

  if(vel.x < 0) {
    phys.decelerate(vel.x, { x: lastX, y: 0 }, { x: -(width * initialScale * els.length - width), y: 0 }, { acceleration: 1000 })
    .then(phys.springTo({ x: -(width * initialScale * els.length - width), y: 0 }))
  } else {
    phys.decelerate(vel.x, { x: lastX, y: 0 }, { x: 0, y: 0 }, { acceleration: 1000 })
    .then(phys.springTo({ x: 0, y: 0 }))
  }
  // if(vel.y < 0)
  //   phys.spring(vel, { x: lastX, y: lastY }, { x: 0, y: 0 }, { k: 20, b: 300 })
  // else
  //   phys.spring(vel, { x: lastX, y: lastY }, { x: -chosenIndex * width, y: height }, { k: 20, b: 300 })
})

function loop() {
  requestAnimationFrame(function() {
    if(mousedown) {
      var scale = lastScale = scaleFromY(lastY)
      layout(lastX, 0.25)//scale)
    }
    loop()
  })
}
loop()

function interpolator(start, end) {
  return function(value) {
    return (value - start) / (end - start)
  }
}

function scaleFromY(y) {
  var f = interpolator(0, height)
  return 0.25 + f(y) * 0.75
}

window.interpolator = interpolator

window.addEventListener(moveEvent, function(evt) {
  evt.preventDefault()
  if(mousedown) {
    var y = lastY = page('y', evt) - fingerOffsetY
      , scale = scaleFromY(y)
      , x = lastX = page('x', evt) - (fingerOffsetX)// * scale/scaleOffset)

    veloX.updatePosition(x)
    veloY.updatePosition(y)
  }
})