var physics = require('rk4')
  , els = [].slice.call(document.querySelectorAll('.thing'))
  , Vector = require('rk4/lib/vector')
  , Velocity = require('touch-velocity')
  , mousedown = false
  , veloX
  , veloY
  , height = window.innerHeight
  , width = window.innerWidth
  , Delegate = require('dom-delegate')
  , initialScale = .4

function page(axis, evt) {
  axis = axis.toUpperCase()
  return (evt.touches && evt.touches[0]['page' + axis]) || evt['page' + axis]
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

function Gallery(els) {
  this.els = els
  this.x = 0
  this.scale = initialScale

  this.width = width
  this.height = height

  var that = this

  var items = this.els.map(function(el) {
    return {
      img: el.querySelector('img'),
      preview: el.querySelector('.preview'),
      full: el.querySelector('.full')
    }
  })

  this.phys = physics(this.els)
  .style({
    hidden: function(p, i) {
      var x = p.x + that.width * p.y * i + 2
      return (x > width || x + that.width * p.y < 0)
    },
    translateX: function(p, i) {
      return p.x + that.width * p.y * i + 2 + 'px'
    },
    scale: function(p, i) {
      var img = items[i].img
      var preview = items[i].preview
      var full = items[i].full
      var previewOpacity

      if(preview) preview.style.webkitTransform = 'translate3d(0, ' + 40 * (1/p.y + .8) + 'px, 0)'
      if(full) full.style.webkitTransform = 'translate3d(0, ' + 40 * (1/p.y + .8) + 'px, 0)'

      if(full && preview) {
        if(p.y < 0.625)
          previewOpacity = 0.99999
        else if(p.y > 0.825)
          previewOpacity = 0.00001
        else
          previewOpacity = 1 - (p.y - 0.625) / 0.2
        preview.style.opacity = previewOpacity
        full.style.opacity = 1 - previewOpacity
      }

      if(img) img.style.webkitTransform = 'scale(' + (1/p.y + .8) + ') translateZ(0)'
      return p.y
    },
    width: (width - 4) + 'px',
    height: height + 'px'
  })
  .position(function(position) {
    that.scale = position.y
    that.x = position.x
  })

  this.phys.setPosition({ x: this.x, y: this.scale })

  var touchEnabled = 'ontouchstart' in document.body
  var startEvent = touchEnabled ? 'touchstart' : 'mousedown'
  var endEvent = touchEnabled ? 'touchend' : 'mouseup'
  var moveEvent = touchEnabled ? 'touchmove' : 'mousemove'

  var delegate = new Delegate(window)
  delegate.on(startEvent, '.thing', this.start.bind(this))
  window.addEventListener(moveEvent, this.move.bind(this))
  window.addEventListener(endEvent, this.end.bind(this))
}

Gallery.prototype.move = function(evt) {
  evt.preventDefault()
  if(!this.mousedown) return

  if(!this.intent) {
    var angle = getAngle(this.initialX, this.initialY, page('x', evt), page('y', evt))
    this.intent = acceptableAngle('X', angle) ? 'horizontal' : 'vertical'
  }
  var y = page('y', evt)
  var scale = this.scale = (this.intent === 'vertical') ? this.scaleOffset * (y / this.initialY) : this.scale
  var x = this.x = page('x', evt) - this.xOffset * this.scale / this.scaleOffset

  this.phys.setPosition({ x: this.x, y: this.scale })
}

Gallery.prototype.start = function(evt, target) {
  //cancel any previously running animations
  this.phys.cancel()
  this.mousedown = true

  this.initialY = page('y', evt)
  this.initialX = page('x', evt)
  this.xOffset = this.initialX - this.x
  this.scaleOffset = this.scale

  for(var i = 0 ; (target = target.previousSibling) != null ; target.nodeType === 1 && i++) {}
  this.chosenIndex = i

  this.intent = null
}

Gallery.prototype.end = function(evt) {
  if(this.intent === 'horizontal' && this.scale <= initialScale + .1)
    endScroll.call(this, evt)
  else if(this.intent === 'horizontal')
    endPage.call(this, evt)
  else
    endZoom.call(this, evt)
}

var leftBoundry = {
  x: -(width * initialScale * els.length - width),
  y: initialScale
}
var rightBoundry = { x: 0, y: initialScale }
var springConst = { k: 100, b: 20 }


function endPage(evt) {
  this.mousedown = false

  var vel = this.phys.getVelocity()
    , nextIndex = (vel.x < 0) ? this.chosenIndex + 1 : this.chosenIndex - 1

  nextIndex = Math.min(els.length - 1, Math.max(nextIndex, 0))
  this.chosenIndex = nextIndex

  return this.phys.spring(vel.x, { x: this.x, y: 1 }, { x: -width * nextIndex , y: 1 }, springConst)
}


function endScroll(evt) {
  this.mousedown = false

  var vel = this.phys.getVelocity()

  if(this.x < leftBoundry.x)
    return this.phys.spring(vel.x, { x: this.x, y: initialScale }, leftBoundry, springConst)
  if(this.x > rightBoundry.x)
    return this.phys.spring(vel.x, { x: this.x, y: initialScale }, rightBoundry, springConst)

  boundry = (vel.x < 0) ? leftBoundry : rightBoundry

  this.phys.decelerate(vel.x, { x: this.x, y: initialScale }, boundry, { acceleration: 1300 })
    .then(this.phys.springTo(boundry, springConst))
}

function endZoom(evt) {
  this.mousedown = false

  var vel = this.phys.getVelocity()
    , springConst = { k: 150, b: 20 }
    , screenOffset = (this.x + this.xOffset * this.scale/this.scaleOffset) * .5
    , finalX = this.x * (initialScale / this.scale) + screenOffset

  finalX = Math.min(rightBoundry.x, Math.max(finalX, leftBoundry.x))

  var position = (vel.y < 0) ? { x: finalX, y: initialScale } : { x: -width * this.chosenIndex, y: 1 }

  return this.phys.spring(vel, { x: this.x, y: this.scale }, position, springConst)
}
setTimeout(function() {
  document.body.scrollLeft = 0
  document.body.scrollTop = 0
  var gallery = new Gallery(els)
}, 200)
