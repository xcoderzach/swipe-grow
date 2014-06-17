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
  , initialY = 0
  , initialX = 0
  , lastX = 0
  , lastY = 0
  , lastScale = .25

function page(axis, evt) {
  axis = axis.toUpperCase()
  return (evt.touches && evt.touches[0]['page' + axis]) || evt['page' + axis]
}

phys.css(function(position) {
  lastX = position.x
  lastScale = position.y

  return {}
})

var fingerOffsetX, fingerOffsetY
  , chosenIndex
var touchEnabled = 'ontouchstart' in document.body
var startEvent = touchEnabled ? 'touchstart' : 'mousedown'
var endEvent = touchEnabled ? 'touchend' : 'mouseup'
var moveEvent = touchEnabled ? 'touchmove' : 'mousemove'

var scaleOffset
var intent

window.addEventListener(startEvent, start)
window.addEventListener(moveEvent, determineIntent)
window.addEventListener(endEvent, end)

function start(evt) {
  phys.cancel()
  mousedown = true
  veloX = new Velocity()
  veloY = new Velocity()

  fingerOffsetX = page('x', evt) - lastX
  initialY = page('y', evt)
  initialX = page('x', evt)
  scaleOffset = lastScale

  veloX.updatePosition(lastX)
  veloY.updatePosition(lastScale)

  var target = evt.target
  for(var i = 0 ; (target = target.previousSibling) != null ; target.nodeType === 1 && i++) {}
  chosenIndex = i

  intent = null
}

function end(evt) {
  if(intent === 'horizontal' && lastScale < .3)
    endScroll.call(this, evt)
  else if(intent === 'horizontal')
    endPage.call(this, evt)
  else
    endZoom.call(this, evt)
}

function getAngle(x1, y1, x2, y2) {
  return 180 + Math.atan2(y2 - y1, x1 - x2) * 180 / Math.PI
}

function acceptableAngle(axis, angle) {
  var acceptableRange = 45
  if(axis === 'X') {
    return angle > 360 - acceptableRange || angle < 0 + acceptableRange ||
           (Math.abs(angle - 180) < acceptableRange)
  } else {
    return (Math.abs(angle - 90) < acceptableRange) ||
           (Math.abs(angle - 270) < acceptableRange)
  }
}

function determineIntent(evt) {
  if(!intent) {
    var angle = getAngle(initialX, initialY, page('x', evt), page('y', evt))
    intent = acceptableAngle('X', angle) ? 'horizontal' : 'vertical'
  }

  if(intent === 'horizontal' && lastScale < .3)
    moveScroll.call(this, evt)
  else if(intent === 'horizontal')
    movePage.call(this, evt)
  else
    moveZoom.call(this, evt)
}

function moveScroll(evt) {
  evt.preventDefault()
  if(mousedown) {
    var y = lastY = page('y', evt)
      , scale = lastScale = .25
      , x = lastX = page('x', evt) - fingerOffsetX * scale / scaleOffset

    veloX.updatePosition(x)
    veloY.updatePosition(scale)
  }
}

function moveZoom(evt) {
  evt.preventDefault()
  if(mousedown) {
    var y = lastY = page('y', evt)
      , scale = lastScale = scaleOffset * (y / initialY)
      , x = lastX = page('x', evt) - fingerOffsetX * scale/scaleOffset

    veloX.updatePosition(x)
    veloY.updatePosition(scale)
  }
}

function movePage(evt) {
  evt.preventDefault()
  if(mousedown) {
    var y = lastY = page('y', evt)
      , scale = lastScale = 1
      , x = lastX = page('x', evt) - fingerOffsetX * scale/scaleOffset

    veloX.updatePosition(x)
    veloY.updatePosition(scale)
  }
}

var leftBoundry = {
  x: -(width * initialScale * els.length - width),
  y: .25
}
var rightBoundry = { x: 0, y: .25 }
var springConst = { k: 100, b: 20 }


function endPage(evt) {
  mousedown = false

  var vel = Vector(veloX.getVelocity() || 0, veloY.getVelocity() || 0)
    , nextIndex = (vel.x < 0) ? chosenIndex + 1 : chosenIndex - 1

  nextIndex = Math.min(els.length - 1, Math.max(nextIndex, 0))
  chosenIndex = nextIndex

  return phys.spring(vel.x, { x: lastX, y: 1 }, { x: -width * nextIndex , y: 1 }, springConst)
}


function endScroll(evt) {
  mousedown = false

  var vel = Vector(veloX.getVelocity() || 0, veloY.getVelocity() || 0)

  if(lastX < leftBoundry.x)
    return phys.spring(vel.x, { x: lastX, y: .25 }, leftBoundry, springConst)
  if(lastX > rightBoundry.x)
    return phys.spring(vel.x, { x: lastX, y: .25 }, rightBoundry, springConst)

  if(vel.x < 0) {
    phys.decelerate(vel.x, { x: lastX, y: .25 }, leftBoundry, { acceleration: 1300 })
    .then(phys.springTo(leftBoundry, springConst))
  } else {
    phys.decelerate(vel.x, { x: lastX, y: .25 }, rightBoundry, { acceleration: 1300 })
    .then(phys.springTo(rightBoundry, springConst))
  }
}

function endZoom(evt) {
  mousedown = false

  var vel = Vector(veloX.getVelocity() || 0, veloY.getVelocity() || 0)
    , springConst = { k: 150, b: 20 }
    , screenOffset = (lastX + fingerOffsetX * lastScale/scaleOffset) * .75
    , finalX = lastX * (.25 / lastScale) + screenOffset
  finalX = Math.min(rightBoundry.x, Math.max(finalX, leftBoundry.x))

  if(vel.y < 0) {
    return phys.spring(vel, { x: lastX, y: lastScale }, { x: finalX, y: .25 }, springConst)
  } else {
    return phys.spring(vel, { x: lastX, y: lastScale }, { x: -width * chosenIndex, y: 1 }, springConst)
  }
}

var setX
  , setScale
function loop() {
  requestAnimationFrame(function() {
    loop()
    if(setX !== lastX || lastScale !== setScale) {
      setX = lastX
      setScale = lastScale
      layout(lastX, lastScale)
    }
  })
}
setTimeout(function() { loop() }, 300)