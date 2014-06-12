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

function page(axis, evt) {
  axis = axis.toUpperCase()
  return (evt.touches && evt.touches[0]['page' + axis]) || evt['page' + axis]
}

phys.css(function(position) {
  var scale = initialScale + (position.y / height) * (1 - initialScale)
  layout(position.x, scale)
  return {}
})

var body = {
  position: Vector(50, 50),
  velocity: Vector(3, 50)
}

var fingerOffsetX, fingerOffsetY
  , chosenIndex

var touchEnabled = 'ontouchstart' in document.body
var startEvent = touchEnabled ? 'touchstart' : 'mousedown'
var endEvent = touchEnabled ? 'touchend' : 'mouseup'
var moveEvent = touchEnabled ? 'touchmove' : 'mousemove'

window.addEventListener(startEvent, function(evt) {
  mousedown = true
  veloX = new Velocity()
  veloY = new Velocity()

  fingerOffsetX = page('x', evt)
  fingerOffsetY = page('y', evt)

  var target = evt.target
  for(var i = 0 ; (target = target.previousSibling) != null ; target.nodeType === 1 && i++) {}
  chosenIndex = i
})

var lastX
  , lastY
  , lastScale

window.addEventListener(endEvent, function(evt) {

  mousedown = false

  var vel = Vector(veloX.getVelocity() || 0, veloY.getVelocity() || 0)

  if(vel.y <= 0)
    phys.spring(vel, { x: lastX, y: lastY }, { x: 0, y: 0 }, { k: 20, b: 300 })
  else
    phys.spring(vel, { x: lastX, y: lastY }, { x: -chosenIndex * width, y: height }, { k: 20, b: 300 })
})

function loop() {
  requestAnimationFrame(function() {
    if(mousedown) {
      layout(lastX, lastScale)
    }
    loop()
  })
}
loop()


window.addEventListener(moveEvent, function(evt) {
  evt.preventDefault()
  if(mousedown) {
    var y = lastY = page('y', evt) - fingerOffsetY
    var scale = lastScale = initialScale + y / height
    var x = lastX = (page('x', evt) - (fingerOffsetX * (scale/initialScale)))

    veloX.updatePosition(x)
    veloY.updatePosition(y)

  }
})