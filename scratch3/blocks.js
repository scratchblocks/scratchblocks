const {
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Glow,
  Script,
  Document,
} = require("../syntax")

const SVG = require("./draw.js")

const { defaultFont, commentFont, makeStyle, makeIcons } = require("./style.js")

/* Label */

var LabelView = function(label) {
  Object.assign(this, label)

  this.el = null
  this.height = 12
  this.metrics = null
  this.x = 0
}
LabelView.prototype.isLabel = true

LabelView.prototype.draw = function() {
  return this.el
}

Object.defineProperty(LabelView.prototype, "width", {
  get: function() {
    return this.metrics.width
  },
})

LabelView.metricsCache = {}
LabelView.toMeasure = []

LabelView.prototype.measure = function() {
  var value = this.value
  var cls = "sb3-" + this.cls
  this.el = SVG.text(0, 13, value, {
    class: "sb3-label " + cls,
  })

  var cache = LabelView.metricsCache[cls]
  if (!cache) {
    cache = LabelView.metricsCache[cls] = Object.create(null)
  }

  if (Object.hasOwnProperty.call(cache, value)) {
    this.metrics = cache[value]
  } else {
    var font = /comment-label/.test(this.cls) ? commentFont : defaultFont
    this.metrics = cache[value] = LabelView.measure(value, font)
    // TODO: word-spacing? (fortunately it seems to have no effect!)
  }
}

LabelView.measure = function(value, font) {
  var context = LabelView.measuring
  context.font = font
  var textMetrics = context.measureText(value)
  var width = (textMetrics.width + 0.5) | 0
  return { width: width }
}

/* Icon */

var IconView = function(icon) {
  Object.assign(this, icon)

  const info = IconView.icons[this.name]
  if (!info) {
    throw new Error("no info for icon: " + this.name)
  }
  Object.assign(this, info)
}
IconView.prototype.isIcon = true

IconView.prototype.draw = function() {
  return SVG.symbol("#" + this.name, {
    width: this.width,
    height: this.height,
  })
}

IconView.icons = {
  greenFlag: { width: 20, height: 21, dy: -2 },
  turnLeft: { width: 15, height: 12, dy: +1 },
  turnRight: { width: 15, height: 12, dy: +1 },
  loopArrow: { width: 14, height: 11 },
  addInput: { width: 4, height: 8 },
  delInput: { width: 4, height: 8 },
}

/* Input */

var InputView = function(input) {
  Object.assign(this, input)
  if (input.label) {
    this.label = newView(input.label)
  }

  this.x = 0
}

InputView.prototype.measure = function() {
  if (this.hasLabel) this.label.measure()
}

InputView.shapes = {
  string: SVG.rect,
  number: SVG.roundedRect,
  "number-dropdown": SVG.roundedRect,
  color: SVG.rect,
  dropdown: SVG.rect,

  boolean: SVG.pointedRect,
  stack: SVG.stackRect,
  reporter: SVG.roundedRect,
}

InputView.prototype.draw = function(parent) {
  if (this.isBoolean) {
    var w = 48
  } else if (this.hasLabel) {
    var label = this.label.draw()
    var w = Math.max(40, this.label.width + 22)
  } else {
    var w = this.isInset ? 30 : this.isColor ? 13 : null
  }
  if (this.hasArrow) w += 20
  this.width = w

  var h = (this.height = 32)

  var el = InputView.shapes[this.shape](w, h)
  SVG.setProps(el, {
    class: [
      "sb3-" + parent.info.category,
      "sb3-input",
      "sb3-input-" + this.shape,
    ].join(" "),
  })

  if (this.isColor) {
    SVG.setProps(el, {
      fill: this.value,
    })
  } else if (this.shape === "dropdown") {
    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: parent.info.color,
        stroke: "rgba(0, 0, 0, 0.2)",
      })
    }
  } else if (this.shape === "number-dropdown") {
    el.classList.add("sb3-" + parent.info.category + "-alt")

    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: "rgba(0, 0, 0, 0.1)",
        stroke: "rgba(0, 0, 0, 0.15)", // combines with fill...
      })
    }
  } else if (this.shape === "boolean") {
    el.classList.add("sb3-" + parent.info.category + "-dark")

    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: "rgba(0, 0, 0, 0.15)",
      })
    }
  }

  var result = SVG.group([el])
  if (this.hasLabel) {
    var x = 11
    result.appendChild(SVG.move(x, 9, label))
  }
  if (this.hasArrow) {
    result.appendChild(
      SVG.move(
        w - 24,
        13,
        SVG.symbol("#dropdownArrow", {
          //width: 12.71,
          //height: 8.79,
        })
      )
    )
  }
  return result
}

/* Block */

var BlockView = function(block) {
  Object.assign(this, block)
  this.children = block.children.map(newView)

  this.x = 0
  this.width = null
  this.height = null
  this.firstLine = null
  this.innerWidth = null
}
BlockView.prototype.isBlock = true

BlockView.prototype.measure = function() {
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i]
    if (child.measure) child.measure()
  }
  if (this.comment) this.comment.measure()
}

BlockView.shapes = {
  stack: SVG.stackRect,
  "c-block": SVG.stackRect,
  "if-block": SVG.stackRect,
  celse: SVG.stackRect,
  cend: SVG.stackRect,

  cap: SVG.capRect,
  reporter: SVG.roundedRect,
  boolean: SVG.pointedRect,
  hat: SVG.hatRect,
  "define-hat": SVG.procHatRect,
  ring: SVG.roundedRect,
}

BlockView.prototype.drawSelf = function(w, h, lines) {
  // mouths
  if (lines.length > 1) {
    return SVG.mouthRect(w, h, this.isFinal, lines, {
      class: ["sb3-" + this.info.category].join(" "),
    })
  }

  // outlines
  if (this.info.shape === "outline") {
    return SVG.setProps(SVG.stackRect(w, h), {
      class: "sb3-outline",
    })
  }

  // rings
  if (this.isRing) {
    var child = this.children[0]
    if (child && (child.isInput || child.isBlock || child.isScript)) {
      var shape = child.isScript
        ? "stack"
        : child.isInput ? child.shape : child.info.shape
      return SVG.ringRect(w, h, child.y, child.width, child.height, shape, {
        class: ["sb3-" + this.info.category].join(" "),
      })
    }
  }

  var func = BlockView.shapes[this.info.shape]
  if (!func) {
    throw new Error("no shape func: " + this.info.shape)
  }
  return func(w, h, {
    class: ["sb3-" + this.info.category].join(" "),
  })
}

BlockView.prototype.minDistance = function(child) {
  if (this.isCommand) {
    return 0
  } else if (this.isBoolean) {
    return child.isReporter
      ? (4 + child.height / 4) | 0
      : child.isLabel
        ? (5 + child.height / 2) | 0
        : child.isBoolean || child.shape === "boolean"
          ? 5
          : (2 + child.height / 2) | 0
  } else if (this.isReporter) {
    return (child.isInput && child.isRound) ||
      ((child.isReporter || child.isBoolean) && !child.hasScript)
      ? 0
      : child.isLabel ? (2 + child.height / 2) | 0 : (-2 + child.height / 2) | 0
  }
  return 0
}

BlockView.padding = {
  // hat: [15, 6, 2],
  // "define-hat": [21, 8, 9],
  // reporter: [3, 4, 1],
  // boolean: [3, 4, 2],
  // cap: [6, 6, 2],
  // "c-block": [6, 8, 4],
  // "if-block": [3, 6, 2],
  // ring: [4, 4, 2],
  null: [4, 8, 4],
}

BlockView.prototype.draw = function() {
  var isDefine = this.info.shape === "define-hat"
  var children = this.children

  var padding = BlockView.padding[this.info.shape] || BlockView.padding[null]
  var pt = padding[0],
    px = padding[1],
    pb = padding[2]

  var isCommand = this.isCommand
  var y = 0
  var Line = function(y) {
    this.y = y
    this.width = 0
    this.height = isCommand ? 40 : 32
    this.children = []
  }

  var innerWidth = 0
  var scriptWidth = 0
  var line = new Line(y)
  function pushLine(isLast) {
    if (lines.length === 0) {
      line.height += pt + pb
    } else {
      line.height += isLast ? 0 : +2
      line.y -= 1
    }
    y += line.height
    lines.push(line)
  }

  if (this.info.isRTL) {
    var start = 0
    var flip = function() {
      children = children
        .slice(0, start)
        .concat(children.slice(start, i).reverse())
        .concat(children.slice(i))
    }.bind(this)
    for (var i = 0; i < children.length; i++) {
      if (children[i].isScript) {
        flip()
        start = i + 1
      }
    }
    if (start < i) {
      flip()
    }
  }

  var lines = []
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    child.el = child.draw(this)

    if (child.isScript && this.isCommand) {
      this.hasScript = true
      pushLine()
      child.y = y - 1
      lines.push(child)
      scriptWidth = Math.max(scriptWidth, Math.max(1, child.width))
      child.height = Math.max(12, child.height) + 3
      y += child.height - 1
      line = new Line(y)
    } else if (child.isArrow) {
      line.children.push(child)
    } else {
      var cmw = i > 0 ? 30 : 0
      var md = this.minDistance(child)
      var mw = this.isCommand ? (child.isBlock || child.isInput ? cmw : 0) : md
      if (mw && !lines.length && line.width < mw - px) {
        line.width = mw - px
      }
      if (child.shape === "number-dropdown") {
        line.width += 3
      }
      child.x = line.width
      line.width += child.width
      innerWidth = Math.max(innerWidth, line.width + Math.max(0, md - px))
      line.width += 5
      if (!child.isLabel) {
        line.height = Math.max(line.height, child.height)
      }
      line.children.push(child)
    }
  }
  pushLine(true)

  innerWidth = Math.max(
    innerWidth + px * 2,
    this.isHat || this.hasScript
      ? 83
      : this.isCommand || this.isOutline || this.isRing ? 39 : 20
  )
  this.height = y

  this.width = scriptWidth ? Math.max(innerWidth, 15 + scriptWidth) : innerWidth
  this.firstLine = lines[0]
  this.innerWidth = innerWidth

  var objects = []

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (line.isScript) {
      objects.push(SVG.move(15, line.y, line.el))
      continue
    }

    var h = line.height

    for (var j = 0; j < line.children.length; j++) {
      var child = line.children[j]
      if (child.isArrow) {
        objects.push(SVG.move(innerWidth - 15, this.height - 3, child.el))
        continue
      }

      var y = pt + (h - child.height - pt - pb) / 2
      if (isDefine && child.isLabel) {
        y += 3
      } else if (child.isIcon) {
        y += child.dy | 0
      }
      if (this.isRing) {
        child.y = (line.y + y) | 0
        if (child.isInset) {
          continue
        }
      }
      objects.push(SVG.move(px + child.x, (line.y + y) | 0, child.el))

      if (child.diff === "+") {
        var ellipse = SVG.insEllipse(child.width, child.height)
        objects.push(SVG.move(px + child.x, (line.y + y) | 0, ellipse))
      }
    }
  }

  var el = this.drawSelf(innerWidth, this.height, lines)
  objects.splice(0, 0, el)
  if (this.info.color) {
    SVG.setProps(el, {
      fill: this.info.color,
      stroke: "rgba(0, 0, 0, 0.2)",
    })
  }

  return SVG.group(objects)
}

/* Comment */

var CommentView = function(comment) {
  Object.assign(this, comment)
  this.label = newView(comment.label)

  this.width = null
}
CommentView.prototype.isComment = true

CommentView.lineLength = 12
CommentView.prototype.height = 20

CommentView.prototype.measure = function() {
  this.label.measure()
}

CommentView.prototype.draw = function() {
  var labelEl = this.label.draw()

  this.width = this.label.width + 16
  return SVG.group([
    SVG.commentLine(this.hasBlock ? CommentView.lineLength : 0, 6),
    SVG.commentRect(this.width, this.height, {
      class: "sb3-comment",
    }),
    SVG.move(8, 4, labelEl),
  ])
}

/* Glow */

var GlowView = function(glow) {
  Object.assign(this, glow)
  this.child = newView(glow.child)

  this.width = null
  this.height = null
  this.y = 0
}
GlowView.prototype.isGlow = true

GlowView.prototype.measure = function() {
  this.child.measure()
}

GlowView.prototype.drawSelf = function() {
  var c = this.child
  var el
  var w = this.width
  var h = this.height - 1
  if (c.isScript) {
    if (!c.isEmpty && c.blocks[0].isHat) {
      el = SVG.hatRect(w, h)
    } else if (c.isFinal) {
      el = SVG.capRect(w, h)
    } else {
      el = SVG.stackRect(w, h)
    }
  } else {
    var el = c.drawSelf(w, h, [])
  }
  return SVG.setProps(el, {
    class: "sb3-diff sb3-diff-ins",
  })
}
// TODO how can we always raise Glows above their parents?

GlowView.prototype.draw = function() {
  var c = this.child
  var el = c.isScript ? c.draw(true) : c.draw()

  this.width = c.width
  this.height = (c.isBlock && c.firstLine.height) || c.height

  // encircle
  return SVG.group([el, this.drawSelf()])
}

/* Script */

var ScriptView = function(script) {
  Object.assign(this, script)
  this.blocks = script.blocks.map(newView)

  this.y = 0
}
ScriptView.prototype.isScript = true

ScriptView.prototype.measure = function() {
  for (var i = 0; i < this.blocks.length; i++) {
    this.blocks[i].measure()
  }
}

ScriptView.prototype.draw = function(inside) {
  var children = []
  var y = 1
  this.width = 0
  for (var i = 0; i < this.blocks.length; i++) {
    var block = this.blocks[i]
    var x = inside ? 0 : 2
    var child = block.draw()
    children.push(SVG.move(x, y, child))
    this.width = Math.max(this.width, block.width)

    var diff = block.diff
    if (diff === "-") {
      var dw = block.width
      var dh = block.firstLine.height || block.height
      children.push(SVG.move(x, y + dh / 2 + 1, SVG.strikethroughLine(dw)))
      this.width = Math.max(this.width, block.width)
    }

    y += block.height

    var comment = block.comment
    if (comment) {
      var line = block.firstLine
      var cx = block.innerWidth + 2 + CommentView.lineLength
      var cy = y - block.height + line.height / 2
      var el = comment.draw()
      children.push(SVG.move(cx, cy - comment.height / 2, el))
      this.width = Math.max(this.width, cx + comment.width)
    }
  }
  this.height = y
  if (!inside && !this.isFinal) {
    this.height += 3
  }
  if (!inside && block.isGlow) {
    this.height += 2 // TODO unbreak this
  }
  return SVG.group(children)
}

/* Document */

var DocumentView = function(doc) {
  Object.assign(this, doc)
  this.scripts = doc.scripts.map(newView)

  this.width = null
  this.height = null
  this.el = null
  this.defs = null
}

DocumentView.prototype.measure = function() {
  this.scripts.forEach(function(script) {
    script.measure()
  })
}

DocumentView.prototype.render = function(cb) {
  if (typeof ocbptions === "function") {
    throw new Error("render() no longer takes a callback")
  }

  // measure strings
  this.measure()

  // TODO: separate layout + render steps.
  // render each script
  var width = 0
  var height = 0
  var elements = []
  for (var i = 0; i < this.scripts.length; i++) {
    var script = this.scripts[i]
    if (height) height += 10
    script.y = height
    elements.push(SVG.move(0, height, script.draw()))
    height += script.height
    width = Math.max(width, script.width + 4)
  }
  this.width = width
  this.height = height

  // return SVG
  var svg = SVG.newSVG(width, height)
  svg.appendChild((this.defs = SVG.withChildren(SVG.el("defs"), makeIcons())))

  svg.appendChild(SVG.group(elements))
  this.el = svg
  return svg
}

/* Export SVG image as XML string */
DocumentView.prototype.exportSVGString = function() {
  if (this.el == null) {
    throw new Error("call draw() first")
  }

  var style = makeStyle()
  this.defs.appendChild(style)
  var xml = new SVG.XMLSerializer().serializeToString(this.el)
  this.defs.removeChild(style)
  return xml
}

/* Export SVG image as data URI */
DocumentView.prototype.exportSVG = function() {
  var xml = this.exportSVGString()
  return "data:image/svg+xml;utf8," + xml.replace(/[#]/g, encodeURIComponent)
}

DocumentView.prototype.toCanvas = function(cb, scale) {
  scale = scale || 1.0

  var canvas = SVG.makeCanvas()
  canvas.width = this.width * scale
  canvas.height = this.height * scale
  var context = canvas.getContext("2d")

  var image = new Image()
  image.src = this.exportSVG()
  image.onload = function() {
    context.save()
    context.scale(scale, scale)
    context.drawImage(image, 0, 0)
    context.restore()

    cb(canvas)
  }
}

DocumentView.prototype.exportPNG = function(cb, scale) {
  this.toCanvas(function(canvas) {
    if (URL && URL.createObjectURL && Blob && canvas.toBlob) {
      var blob = canvas.toBlob(function(blob) {
        cb(URL.createObjectURL(blob))
      }, "image/png")
    } else {
      cb(canvas.toDataURL("image/png"))
    }
  }, scale)
}

/* view */

const viewFor = node => {
  switch (node.constructor) {
    case Label:
      return LabelView
    case Icon:
      return IconView
    case Input:
      return InputView
    case Block:
      return BlockView
    case Comment:
      return CommentView
    case Glow:
      return GlowView
    case Script:
      return ScriptView
    case Document:
      return DocumentView
    default:
      throw new Error("no view for " + node.constructor.name)
  }
}

const newView = node => new (viewFor(node))(node)

module.exports = {
  newView,
  LabelView,
}
