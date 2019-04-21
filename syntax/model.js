function assert(bool, message) {
  if (!bool) throw "Assertion failed! " + (message || "")
}
function isArray(o) {
  return o && o.constructor === Array
}

function indent(text) {
  return text
    .split("\n")
    .map(function(line) {
      return "  " + line
    })
    .join("\n")
}

function maybeNumber(v) {
  v = "" + v
  var n = parseInt(v)
  if (!isNaN(n)) {
    return n
  }
  var f = parseFloat(v)
  if (!isNaN(f)) {
    return f
  }
  return v
}

var {
  blocksBySelector,
  parseSpec,
  inputPat,
  parseInputNumber,
  iconPat,
  rtlLanguages,
  unicodeIcons,
  english,
  blockName,
} = require("./blocks.js")

/* Label */

var Label = function(value, cls) {
  this.value = value
  this.cls = cls || ""
  this.el = null
  this.height = 12
  this.metrics = null
  this.x = 0
}
Label.prototype.isLabel = true

Label.prototype.stringify = function() {
  if (this.value === "<" || this.value === ">") return this.value
  return this.value.replace(/([<>[\](){}])/g, "\\$1")
}

/* Icon */

var Icon = function(name) {
  this.name = name
  this.isArrow = name === "loopArrow"

  assert(Icon.icons[name], "no info for icon " + name)
}
Icon.prototype.isIcon = true

Icon.icons = {
  greenFlag: true,
  turnLeft: true,
  turnRight: true,
  loopArrow: true,
  addInput: true,
  delInput: true,
}

Icon.prototype.stringify = function() {
  return unicodeIcons["@" + this.name] || ""
}

/* Input */

var Input = function(shape, value, menu) {
  this.shape = shape
  this.value = value
  this.menu = menu || null

  this.isRound = shape === "number" || shape === "number-dropdown"
  this.isBoolean = shape === "boolean"
  this.isStack = shape === "stack"
  this.isInset =
    shape === "boolean" || shape === "stack" || shape === "reporter"
  this.isColor = shape === "color"
  this.hasArrow = shape === "dropdown" || shape === "number-dropdown"
  this.isDarker =
    shape === "boolean" || shape === "stack" || shape === "dropdown"
  this.isSquare =
    shape === "string" || shape === "color" || shape === "dropdown"

  this.hasLabel = !(this.isColor || this.isInset)
  this.label = this.hasLabel ? new Label(value, "literal-" + this.shape) : null
  this.x = 0
}
Input.prototype.isInput = true

Input.fromJSON = function(lang, value, part) {
  var shape = {
    b: "boolean",
    n: "number",
    s: "string",
    d: "number-dropdown",
    m: "dropdown",
    c: "color",
  }[part[1]]

  if (shape === "color") {
    if (!value && value !== 0) value = parseInt(Math.random() * 256 * 256 * 256)
    value = +value
    if (value < 0) value = 0xffffffff + value + 1
    var hex = value.toString(16)
    hex = hex.slice(Math.max(0, hex.length - 6)) // last 6 characters
    while (hex.length < 6) hex = "0" + hex
    if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
      hex = hex[0] + hex[2] + hex[4]
    }
    value = "#" + hex
  } else if (shape === "dropdown") {
    value =
      {
        _mouse_: "mouse-pointer",
        _myself_: "myself",
        _stage_: "Stage",
        _edge_: "edge",
        _random_: "random position",
      }[value] || value
    var menu = value
    // TODO translate dropdown value
  } else if (shape === "number-dropdown") {
    // TODO translate dropdown value
  }

  return new Input(shape, "" + value, menu)
}

Input.prototype.toJSON = function() {
  if (this.isColor) {
    assert(this.value[0] === "#")
    var h = this.value.slice(1)
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return parseInt(h, 16)
    // TODO signed int?
  }
  if (this.hasArrow) {
    var value = this.menu || this.value
    if (this.shape === "dropdown") {
      value =
        {
          "mouse-pointer": "_mouse_",
          myself: "_myself",
          Stage: "_stage_",
          edge: "_edge_",
          "random position": "_random_",
        }[value] || value
    }
    if (this.isRound) {
      value = maybeNumber(value)
    }
    return value
  }
  return this.isBoolean
    ? false
    : this.isRound ? maybeNumber(this.value) : this.value
}

Input.prototype.stringify = function() {
  if (this.isColor) {
    assert(this.value[0] === "#")
    return "[" + this.value + "]"
  }
  var text = (this.value ? "" + this.value : "")
    .replace(/ v$/, " \\v")
    .replace(/([\]\\])/g, "\\$1")
  if (this.hasArrow) text += " v"
  return this.isRound
    ? "(" + text + ")"
    : this.isSquare
      ? "[" + text + "]"
      : this.isBoolean ? "<>" : this.isStack ? "{}" : text
}

Input.prototype.translate = function(lang) {
  if (this.hasArrow) {
    var value = this.menu || this.value
    this.value = value // TODO translate dropdown value
    this.label = new Label(this.value, "literal-" + this.shape)
  }
}

/* Block */

var Block = function(info, children, comment) {
  assert(info)
  this.info = Object.assign({}, info)
  this.children = children
  this.comment = comment || null
  this.diff = null

  var shape = this.info.shape
  this.isHat = shape === "hat" || shape === "define-hat"
  this.hasPuzzle = shape === "stack" || shape === "hat"
  this.isFinal = /cap/.test(shape)
  this.isCommand = shape === "stack" || shape === "cap" || /block/.test(shape)
  this.isOutline = shape === "outline"
  this.isReporter = shape === "reporter"
  this.isBoolean = shape === "boolean"

  this.isRing = shape === "ring"
  this.hasScript = /block/.test(shape)
  this.isElse = shape === "celse"
  this.isEnd = shape === "cend"
}
Block.prototype.isBlock = true

Block.fromJSON = function(lang, array, part) {
  var args = array.slice()
  var selector = args.shift()
  if (selector === "procDef") {
    var spec = args[0]
    var inputNames = args[1].slice()
    // var defaultValues = args[2];
    // var isAtomic = args[3]; // TODO

    var info = parseSpec(spec)
    var children = info.parts.map(function(part) {
      if (inputPat.test(part)) {
        var label = new Label(inputNames.shift())
        return new Block(
          {
            shape: part[1] === "b" ? "boolean" : "reporter",
            category: "custom-arg",
          },
          [label]
        )
      } else {
        return new Label(part)
      }
    })
    var outline = new Block(
      {
        shape: "outline",
        category: "custom",
      },
      children
    )

    var children = [new Label(lang.define[0]), outline]
    return new Block(
      {
        shape: "define-hat",
        category: "custom",
        selector: "procDef",
        call: spec,
        names: args[1],
        language: lang,
      },
      children
    )
  } else if (selector === "call") {
    var spec = args.shift()
    var info = Object.assign({}, parseSpec(spec), {
      category: "custom",
      shape: "stack",
      selector: "call",
      call: spec,
      language: lang,
    })
    var parts = info.parts
    var inputs = info.inputs
  } else if (
    selector === "readVariable" ||
    selector === "contentsOfList:" ||
    selector === "getParam"
  ) {
    var shape =
      selector === "getParam" && args.pop() === "b" ? "boolean" : "reporter"
    var info = {
      selector: selector,
      shape: shape,
      category: {
        readVariable: "variables",
        "contentsOfList:": "list",
        getParam: "custom-arg",
      }[selector],
      language: lang,
    }
    return new Block(info, [new Label(args[0])])
  } else {
    var info = Object.assign({}, blocksBySelector[selector], {
      language: lang,
    })
    assert(info, "unknown selector: " + selector)
    var spec = lang.commands[info.spec] || spec
    var parts = spec ? parseSpec(spec).parts : info.parts
    var inputs = info.inputs
  }
  var children = parts.map(function(part) {
    var number = parseInputNumber(part)
    if (number) {
      var input = inputs[number - 1]
      var arg = args.shift() // TODO
      return (isArray(arg) ? Block : Input).fromJSON(lang, arg, input)
    } else if (iconPat.test(part)) {
      return new Icon(part.slice(1))
    } else {
      return new Label(part.trim())
    }
  })
  args.forEach(function(list, index) {
    list = list || []
    assert(isArray(list))
    children.push(new Script(list.map(Block.fromJSON.bind(null, lang))))
    if (selector === "doIfElse" && index === 0) {
      children.push(new Label(lang.commands["else"]))
    }
  })
  // TODO loop arrows
  return new Block(info, children)
}

Block.prototype.toJSON = function() {
  var selector = this.info.selector
  var args = []

  if (selector === "procDef") {
    var inputNames = this.info.names
    var spec = this.info.call
    var info = parseSpec(spec)
    var defaultValues = info.inputs.map(function(input) {
      return input === "%n" ? 1 : input === "%b" ? false : ""
    })
    var isAtomic = false // TODO 'define-atomic' ??
    return ["procDef", spec, inputNames, defaultValues, isAtomic]
  }

  if (
    selector === "readVariable" ||
    selector === "contentsOfList:" ||
    selector === "getParam"
  ) {
    args.push(blockName(this))
    if (selector === "getParam")
      args.push(this.isBoolean === "boolean" ? "b" : "r")
  } else {
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i]
      if (child.isInput || child.isBlock || child.isScript) {
        args.push(child.toJSON())
      }
    }

    if (selector === "call") {
      return ["call", this.info.call].concat(args)
    }
  }
  if (!selector) throw new Error("unknown block: " + this.info.hash)
  return [selector].concat(args)
}

Block.prototype.stringify = function(extras) {
  var firstInput = null
  var checkAlias = false
  var text = this.children
    .map(function(child) {
      if (child.isIcon) checkAlias = true
      if (!firstInput && !(child.isLabel || child.isIcon)) firstInput = child
      return child.isScript
        ? "\n" + indent(child.stringify()) + "\n"
        : child.stringify().trim() + " "
    })
    .join("")
    .trim()

  var lang = this.info.language
  if (checkAlias && lang && this.info.selector) {
    var type = blocksBySelector[this.info.selector]
    var spec = type.spec
    var alias = lang.nativeAliases[type.spec]
    if (alias) {
      // TODO make translate() not in-place, and use that
      if (inputPat.test(alias) && firstInput) {
        alias = alias.replace(inputPat, firstInput.stringify())
      }
      return alias
    }
  }

  var overrides = extras || ""
  if (
    this.info.categoryIsDefault === false ||
    (this.info.category === "custom-arg" &&
      (this.isReporter || this.isBoolean)) ||
    (this.info.category === "custom" && this.info.shape === "stack")
  ) {
    if (overrides) overrides += " "
    overrides += this.info.category
  }
  if (overrides) {
    text += " :: " + overrides
  }
  return this.hasScript
    ? text + "\nend"
    : this.info.shape === "reporter"
      ? "(" + text + ")"
      : this.info.shape === "boolean" ? "<" + text + ">" : text
}

Block.prototype.translate = function(lang, isShallow) {
  if (!lang) throw new Error("Missing language")

  var selector = this.info.selector
  if (!selector) return
  if (selector === "procDef") {
    assert(this.children[0].isLabel)
    this.children[0] = new Label(lang.define[0] || english.define[0])
  }

  var block = blocksBySelector[selector]
  if (!block) return
  var nativeSpec = lang.commands[block.spec]
  if (!nativeSpec) return
  var nativeInfo = parseSpec(nativeSpec)

  var oldSpec = this.info.language.commands[block.spec]

  // Work out indexes of existing children
  var rawArgs = this.children.filter(function(child) {
    return !child.isLabel && !child.isIcon
  })
  var oldParts = parseSpec(oldSpec).parts
  var oldInputOrder = oldParts
    .map(part => parseInputNumber(part))
    .filter(x => !!x)
  var args = oldInputOrder.map(number => rawArgs[number - 1])

  if (!isShallow) {
    args.forEach(function(child) {
      child.translate(lang)
    })
  }

  // Get new children by index
  this.children = nativeInfo.parts
    .map(function(part) {
      var part = part.trim()
      if (!part) return
      var number = parseInputNumber(part)
      if (number) {
        return args[number - 1]
      } else {
        return iconPat.test(part) ? new Icon(part.slice(1)) : new Label(part)
      }
    })
    .filter(x => !!x)

  // Push any remaining children??
  // args.forEach(arg => {
  //   this.children.push(arg)
  // })
  this.info.language = lang
  this.info.isRTL = rtlLanguages.indexOf(lang.code) > -1
  this.info.categoryIsDefault = true
}

/* Comment */

var Comment = function(value, hasBlock) {
  this.label = new Label(value, "comment-label")
  this.width = null
  this.hasBlock = hasBlock
}
Comment.prototype.isComment = true

Comment.prototype.stringify = function() {
  return "// " + this.label.value
}

/* Glow */

var Glow = function(child) {
  assert(child)
  this.child = child
  if (child.isBlock) {
    this.shape = child.info.shape
    this.info = child.info
  } else {
    this.shape = "stack"
  }
}
Glow.prototype.isGlow = true

Glow.prototype.stringify = function() {
  if (this.child.isBlock) {
    return this.child.stringify("+")
  } else {
    var lines = this.child.stringify().split("\n")
    return lines.map(line => "+ " + line).join("\n")
  }
}

Glow.prototype.translate = function(lang) {
  this.child.translate(lang)
}

/* Script */

var Script = function(blocks) {
  this.blocks = blocks
  this.isEmpty = !blocks.length
  this.isFinal = !this.isEmpty && blocks[blocks.length - 1].isFinal
}
Script.prototype.isScript = true

Script.fromJSON = function(lang, blocks) {
  // x = array[0], y = array[1];
  return new Script(blocks.map(Block.fromJSON.bind(null, lang)))
}

Script.prototype.toJSON = function() {
  if (this.blocks[0] && this.blocks[0].isComment) return
  return this.blocks.map(function(block) {
    return block.toJSON()
  })
}

Script.prototype.stringify = function() {
  return this.blocks
    .map(function(block) {
      var line = block.stringify()
      if (block.comment) line += " " + block.comment.stringify()
      return line
    })
    .join("\n")
}

Script.prototype.translate = function(lang) {
  this.blocks.forEach(function(block) {
    block.translate(lang)
  })
}

/* Document */

var Document = function(scripts) {
  this.scripts = scripts
}

Document.fromJSON = function(scriptable, lang) {
  var lang = lang || english
  var scripts = scriptable.scripts.map(function(array) {
    var script = Script.fromJSON(lang, array[2])
    script.x = array[0]
    script.y = array[1]
    return script
  })
  // TODO scriptable.scriptComments
  return new Document(scripts)
}

Document.prototype.toJSON = function() {
  var jsonScripts = this.scripts
    .map(function(script) {
      var jsonBlocks = script.toJSON()
      if (!jsonBlocks) return
      return [10, script.y + 10, jsonBlocks]
    })
    .filter(x => !!x)
  return {
    scripts: jsonScripts,
    // scriptComments: [], // TODO
  }
}

Document.prototype.stringify = function() {
  return this.scripts
    .map(function(script) {
      return script.stringify()
    })
    .join("\n\n")
}

Document.prototype.translate = function(lang) {
  this.scripts.forEach(function(script) {
    script.translate(lang)
  })
}

module.exports = {
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Glow,
  Script,
  Document,
}
