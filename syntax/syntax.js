function isArray(o) {
  return o && o.constructor === Array
}
function assert(bool, message) {
  if (!bool) throw "Assertion failed! " + (message || "")
}

var {
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Glow,
  Script,
  Document,
} = require("./model.js")

var {
  allLanguages,
  lookupDropdown,
  hexColorPat,
  minifyHash,
  lookupHash,
  hashSpec,
  applyOverrides,
  rtlLanguages,
  iconPat,
  blockName,
} = require("./blocks.js")

function paintBlock(info, children, languages) {
  var overrides = []
  if (isArray(children[children.length - 1])) {
    overrides = children.pop()
  }

  // build hash
  var words = []
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.isLabel) {
      words.push(child.value)
    } else if (child.isIcon) {
      words.push("@" + child.name)
    } else {
      words.push("_")
    }
  }
  var string = words.join(" ")
  var shortHash = (info.hash = minifyHash(string))

  // paint
  var o = lookupHash(shortHash, info, children, languages)
  if (o) {
    var lang = o.lang
    var type = o.type
    info.language = lang
    info.isRTL = rtlLanguages.indexOf(lang.code) > -1

    if (
      type.shape === "ring" ? info.shape === "reporter" : info.shape === "stack"
    ) {
      info.shape = type.shape
    }
    info.category = type.category
    info.categoryIsDefault = true
    // store selector, used for translation among other things
    if (type.selector) info.selector = type.selector
    if (type.id) info.id = type.id
    info.hasLoopArrow = type.hasLoopArrow

    // ellipsis block
    if (type.spec === ". . .") {
      children = [new Label(". . .")]
    }
  }

  // overrides
  applyOverrides(info, overrides)

  // loop arrows
  if (info.hasLoopArrow) {
    children.push(new Icon("loopArrow"))
  }

  var block = new Block(info, children)

  // image replacement
  if (type && iconPat.test(type.spec)) {
    block.translate(lang, true)
  }

  // diffs
  if (info.diff === "+") {
    return new Glow(block)
  } else {
    block.diff = info.diff
  }
  return block
}

function parseLines(code, languages) {
  var tok = code[0]
  var index = 0
  function next() {
    tok = code[++index]
  }
  function peek() {
    return code[index + 1]
  }
  function peekNonWs() {
    for (var i = index + 1; i < code.length; i++) {
      if (code[i] !== " ") return code[i]
    }
  }
  var sawNL

  var define = []
  languages.map(function(lang) {
    define = define.concat(lang.define)
  })
  // NB. we assume 'define' is a single word in every language
  function isDefine(word) {
    return define.indexOf(word) > -1
  }

  function makeBlock(shape, children) {
    var hasInputs = !!children.filter(function(x) {
      return !x.isLabel
    }).length

    var info = {
      shape: shape,
      category:
        shape === "define-hat"
          ? "custom"
          : shape === "reporter" && !hasInputs ? "variables" : "obsolete",
      categoryIsDefault: true,
      hasLoopArrow: false,
    }

    return paintBlock(info, children, languages)
  }

  function makeMenu(shape, value) {
    var menu = lookupDropdown(value, languages) || value
    return new Input(shape, value, menu)
  }

  function pParts(end) {
    var children = []
    var label
    while (tok && tok !== "\n") {
      if (tok === "<" || (tok === ">" && end === ">")) {
        var last = children[children.length - 1]
        var c = peekNonWs()
        if (
          last &&
          !last.isLabel &&
          (c === "[" || c === "(" || c === "<" || c === "{")
        ) {
          label = null
          children.push(new Label(tok))
          next()
          continue
        }
      }
      if (tok === end) break
      if (tok === "/" && peek() === "/" && !end) break

      switch (tok) {
        case "[":
          label = null
          children.push(pString())
          break
        case "(":
          label = null
          children.push(pReporter())
          break
        case "<":
          label = null
          children.push(pPredicate())
          break
        case "{":
          label = null
          children.push(pEmbedded())
          break
        case " ":
        case "\t":
          next()
          if (label && isDefine(label.value)) {
            // define hat
            children.push(pOutline())
            return children
          }
          label = null
          break
        case "◂":
        case "▸":
          children.push(pIcon())
          label = null
          break
        case "@":
          next()
          var name = ""
          while (tok && /[a-zA-Z]/.test(tok)) {
            name += tok
            next()
          }
          if (name === "cloud") {
            children.push(new Label("☁"))
          } else {
            children.push(
              Icon.icons.hasOwnProperty(name)
                ? new Icon(name)
                : new Label("@" + name)
            )
          }
          label = null
          break
        case "\\":
          next() // escape character
        // fall-thru
        case ":":
          if (tok === ":" && peek() === ":") {
            children.push(pOverrides(end))
            return children
          } // fall-thru
        default:
          if (!label) children.push((label = new Label("")))
          label.value += tok
          next()
      }
    }
    return children
  }

  function pString() {
    next() // '['
    var s = ""
    var escapeV = false
    while (tok && tok !== "]" && tok !== "\n") {
      if (tok === "\\") {
        next()
        if (tok === "v") escapeV = true
        if (!tok) break
      } else {
        escapeV = false
      }
      s += tok
      next()
    }
    if (tok === "]") next()
    if (hexColorPat.test(s)) {
      return new Input("color", s)
    }
    return !escapeV && / v$/.test(s)
      ? makeMenu("dropdown", s.slice(0, s.length - 2))
      : new Input("string", s)
  }

  function pBlock(end) {
    var children = pParts(end)
    if (tok && tok === "\n") {
      sawNL = true
      next()
    }
    if (children.length === 0) return

    // define hats
    var first = children[0]
    if (first && first.isLabel && isDefine(first.value)) {
      if (children.length < 2) {
        children.push(makeBlock("outline", []))
      }
      return makeBlock("define-hat", children)
    }

    // standalone reporters
    if (children.length === 1) {
      var child = children[0]
      if (
        child.isBlock &&
        (child.isReporter || child.isBoolean || child.isRing)
      ) {
        return child
      }
    }

    return makeBlock("stack", children)
  }

  function pReporter() {
    next() // '('

    // empty number-dropdown
    if (tok === " ") {
      next()
      if (tok === "v" && peek() === ")") {
        next()
        next()
        return new Input("number-dropdown", "")
      }
    }

    var children = pParts(")")
    if (tok && tok === ")") next()

    // empty numbers
    if (children.length === 0) {
      return new Input("number", "")
    }

    // number
    if (children.length === 1 && children[0].isLabel) {
      var value = children[0].value
      if (/^[0-9e.-]*$/.test(value)) {
        return new Input("number", value)
      }
      if (hexColorPat.test(value)) {
        return new Input("color", value)
      }
    }

    // number-dropdown
    for (var i = 0; i < children.length; i++) {
      if (!children[i].isLabel) {
        break
      }
    }
    if (i === children.length) {
      var last = children[i - 1]
      if (i > 1 && last.value === "v") {
        children.pop()
        var value = children
          .map(function(l) {
            return l.value
          })
          .join(" ")
        return makeMenu("number-dropdown", value)
      }
    }

    var block = makeBlock("reporter", children)

    // rings
    if (block.info && block.info.shape === "ring") {
      var first = block.children[0]
      if (
        first &&
        first.isInput &&
        first.shape === "number" &&
        first.value === ""
      ) {
        block.children[0] = new Input("reporter")
      } else if (
        (first && first.isScript && first.isEmpty) ||
        (first && first.isBlock && !first.children.length)
      ) {
        block.children[0] = new Input("stack")
      }
    }

    return block
  }

  function pPredicate() {
    next() // '<'
    var children = pParts(">")
    if (tok && tok === ">") next()
    if (children.length === 0) {
      return new Input("boolean")
    }
    return makeBlock("boolean", children)
  }

  function pEmbedded() {
    next() // '{'

    sawNL = false
    var f = function() {
      while (tok && tok !== "}") {
        var block = pBlock("}")
        if (block) return block
      }
    }
    var scripts = parseScripts(f)
    var blocks = []
    scripts.forEach(function(script) {
      blocks = blocks.concat(script.blocks)
    })

    if (tok === "}") next()
    if (!sawNL) {
      assert(blocks.length <= 1)
      return blocks.length ? blocks[0] : makeBlock("stack", [])
    }
    return new Script(blocks)
  }

  function pIcon() {
    var c = tok
    next()
    switch (c) {
      case "▸":
        return new Icon("addInput")
      case "◂":
        return new Icon("delInput")
    }
  }

  function pOverrides(end) {
    next()
    next()
    var overrides = []
    var override = ""
    while (tok && tok !== "\n" && tok !== end) {
      if (tok === " ") {
        if (override) {
          overrides.push(override)
          override = ""
        }
      } else if (tok === "/" && peek() === "/") {
        break
      } else {
        override += tok
      }
      next()
    }
    if (override) overrides.push(override)
    return overrides
  }

  function pComment(end) {
    next()
    next()
    var comment = ""
    while (tok && tok !== "\n" && tok !== end) {
      comment += tok
      next()
    }
    if (tok && tok === "\n") next()
    return new Comment(comment, true)
  }

  function pOutline() {
    var children = []
    function parseArg(kind, end) {
      label = null
      next()
      var parts = pParts(end)
      if (tok === end) next()
      children.push(
        paintBlock(
          {
            shape: kind === "boolean" ? "boolean" : "reporter",
            argument: kind,
            category: "custom-arg",
          },
          parts,
          languages
        )
      )
    }
    var label
    while (tok && tok !== "\n") {
      if (tok === "/" && peek() === "/") {
        break
      }
      switch (tok) {
        case "(":
          parseArg("number", ")")
          break
        case "[":
          parseArg("string", "]")
          break
        case "<":
          parseArg("boolean", ">")
          break
        case " ":
          next()
          label = null
          break
        case "\\":
          next()
        // fall-thru
        case ":":
          if (tok === ":" && peek() === ":") {
            children.push(pOverrides())
            break
          } // fall-thru
        default:
          if (!label) children.push((label = new Label("")))
          label.value += tok
          next()
      }
    }
    return makeBlock("outline", children)
  }

  function pLine() {
    var diff
    if (tok === "+" || tok === "-") {
      diff = tok
      next()
    }
    var block = pBlock()
    if (tok === "/" && peek() === "/") {
      var comment = pComment()
      comment.hasBlock = block && block.children.length
      if (!comment.hasBlock) {
        return comment
      }
      block.comment = comment
    }
    if (block) block.diff = diff
    return block
  }

  return function() {
    if (!tok) return undefined
    var line = pLine()
    return line || "NL"
  }
}

/* * */

function parseScripts(getLine) {
  var line = getLine()
  function next() {
    line = getLine()
  }

  function pFile() {
    while (line === "NL") next()
    var scripts = []
    while (line) {
      var blocks = []
      while (line && line !== "NL") {
        var b = pLine()
        var isGlow = b.diff === "+"
        if (isGlow) {
          b.diff = null
        }

        if (b.isElse || b.isEnd) {
          b = new Block(
            Object.assign({}, b.info, {
              shape: "stack",
            }),
            b.children
          )
        }

        if (isGlow) {
          var last = blocks[blocks.length - 1]
          var children = []
          if (last && last.isGlow) {
            blocks.pop()
            var children = last.child.isScript
              ? last.child.blocks
              : [last.child]
          }
          children.push(b)
          blocks.push(new Glow(new Script(children)))
        } else if (b.isHat) {
          if (blocks.length) scripts.push(new Script(blocks))
          blocks = [b]
        } else if (b.isFinal) {
          blocks.push(b)
          break
        } else if (b.isCommand) {
          blocks.push(b)
        } else {
          // reporter or predicate
          if (blocks.length) scripts.push(new Script(blocks))
          scripts.push(new Script([b]))
          blocks = []
          break
        }
      }
      if (blocks.length) scripts.push(new Script(blocks))
      while (line === "NL") next()
    }
    return scripts
  }

  function pLine() {
    var b = line
    next()

    if (b.hasScript) {
      while (true) {
        var blocks = pMouth()
        b.children.push(new Script(blocks))
        if (line && line.isElse) {
          for (var i = 0; i < line.children.length; i++) {
            b.children.push(line.children[i])
          }
          next()
          continue
        }
        if (line && line.isEnd) {
          next()
        }
        break
      }
    }
    return b
  }

  function pMouth() {
    var blocks = []
    while (line) {
      if (line === "NL") {
        next()
        continue
      }
      if (!line.isCommand) {
        return blocks
      }

      var b = pLine()
      var isGlow = b.diff === "+"
      if (isGlow) {
        b.diff = null
      }

      if (isGlow) {
        var last = blocks[blocks.length - 1]
        var children = []
        if (last && last.isGlow) {
          blocks.pop()
          var children = last.child.isScript ? last.child.blocks : [last.child]
        }
        children.push(b)
        blocks.push(new Glow(new Script(children)))
      } else {
        blocks.push(b)
      }
    }
    return blocks
  }

  return pFile()
}

/* * */

function eachBlock(x, cb) {
  if (x.isScript) {
    x.blocks = x.blocks.map(function(block) {
      eachBlock(block, cb)
      return cb(block) || block
    })
  } else if (x.isBlock) {
    x.children = x.children.map(function(child) {
      eachBlock(child, cb)
      return cb(child) || child
    })
  } else if (x.isGlow) {
    eachBlock(x.child, cb)
  }
}

var listBlocks = {
  "append:toList:": 1,
  "deleteLine:ofList:": 1,
  "insert:at:ofList:": 2,
  "setLine:ofList:to:": 1,
  "showList:": 0,
  "hideList:": 0,
}

var variableBlocks = {
  "setVar:to:": 0,
  "changeVar:by:": 0,
  "showVariable:": 0,
  "hideVariable:": 0,
}

function recogniseStuff(scripts) {
  // Object.create(null) is JS magic for an "empty dictionary"
  // In ES6-land a Set would be more appropriate
  var customBlocksByHash = Object.create(null)
  var listNames = Object.create(null)
  var variableNames = Object.create(null)

  scripts.forEach(function(script) {
    var customArgs = Object.create(null)

    eachBlock(script, function(block) {
      if (!block.isBlock) return

      // custom blocks
      if (block.info.shape === "define-hat") {
        var outline = block.children[1]
        if (!outline) return

        var names = []
        var parts = []
        for (var i = 0; i < outline.children.length; i++) {
          var child = outline.children[i]
          if (child.isLabel) {
            parts.push(child.value)
          } else if (child.isBlock) {
            if (!child.info.argument) return
            parts.push(
              {
                number: "%n",
                string: "%s",
                boolean: "%b",
              }[child.info.argument]
            )

            var name = blockName(child)
            names.push(name)
            customArgs[name] = true
          }
        }
        var spec = parts.join(" ")
        var hash = hashSpec(spec)
        var info = (customBlocksByHash[hash] = {
          spec: spec,
          names: names,
        })
        block.info.id = "PROCEDURES_DEFINITION"
        block.info.selector = "procDef"
        block.info.call = info.spec
        block.info.names = info.names
        block.info.category = "custom"

        // custom arguments
      } else if (
        block.info.categoryIsDefault &&
        (block.isReporter || block.isBoolean)
      ) {
        var name = blockName(block)
        if (customArgs[name]) {
          block.info.category = "custom-arg"
          block.info.categoryIsDefault = false
          block.info.selector = "getParam"
        }

        // list names
      } else if (listBlocks.hasOwnProperty(block.info.selector)) {
        var argIndex = listBlocks[block.info.selector]
        var inputs = block.children.filter(function(child) {
          return !child.isLabel
        })
        var input = inputs[argIndex]
        if (input && input.isInput) {
          listNames[input.value] = true
        }
      }
    })
  })

  scripts.forEach(function(script) {
    eachBlock(script, function(block) {
      if (
        block.info &&
        block.info.categoryIsDefault &&
        block.info.category === "obsolete"
      ) {
        // custom blocks
        var info = customBlocksByHash[block.info.hash]
        if (info) {
          block.info.selector = "call"
          block.info.call = info.spec
          block.info.names = info.names
          block.info.category = "custom"
        }
        return
      }

      var name, info
      if (
        block.isReporter &&
        block.info.category === "variables" &&
        block.info.categoryIsDefault
      ) {
        // We set the selector here for some reason
        block.info.selector = "readVariable"
        name = blockName(block)
        info = block.info
      }
      if (!name) return

      // list reporters
      if (listNames[name]) {
        info.category = "list"
        info.categoryIsDefault = false
        info.selector = "contentsOfList:"

        // variable reporters
      } else if (variableNames[name]) {
        info.category = "variables"
        info.categoryIsDefault = false
        info.selector = "readVariable"
      } else {
        return
      }

      return // already done
    })
  })
}

function parse(code, options) {
  var options = Object.assign(
    {
      inline: false,
      languages: ["en"],
    },
    options
  )

  if (options.dialect) {
    throw new Error("Option 'dialect' no longer supported")
  }

  code = code.replace(/&lt;/g, "<")
  code = code.replace(/&gt;/g, ">")
  if (options.inline) {
    code = code.replace(/\n/g, " ")
  }

  var languages = options.languages.map(function(code) {
    var lang = allLanguages[code]
    if (!lang) throw new Error("Unknown language: '" + code + "'")
    return lang
  })

  /* * */

  var f = parseLines(code, languages)
  var scripts = parseScripts(f)
  recogniseStuff(scripts)
  return new Document(scripts)
}

module.exports = {
  parse: parse,
}
