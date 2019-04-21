function assert(bool, message) {
  if (!bool) throw "Assertion failed! " + (message || "")
}
function isArray(o) {
  return o && o.constructor === Array
}

// List of classes we're allowed to override.

var overrideCategories = [
  "motion",
  "looks",
  "sound",
  "pen",
  "variables",
  "list",
  "events",
  "control",
  "sensing",
  "operators",
  "custom",
  "custom-arg",
  "extension",
  "grey",
  "obsolete",
  "music",
  "video",
  "tts",
  "translate",
  "wedo",
  "ev3",
  "microbit",
  "makeymakey",
]
var overrideShapes = ["hat", "cap", "stack", "boolean", "reporter", "ring"]

// languages that should be displayed right to left
var rtlLanguages = ["ar", "ckb", "fa", "he"]

// List of commands taken from Scratch
var scratchCommands = require("./commands.js")

var inputNumberPat = /\%([0-9]+)/
var inputPat = /(%[a-zA-Z0-9](?:\.[a-zA-Z0-9]+)?)/
var inputPatGlobal = new RegExp(inputPat.source, "g")
var iconPat = /(@[a-zA-Z]+)/
var splitPat = new RegExp(
  [inputPat.source, "|", iconPat.source, "| +"].join(""),
  "g"
)

var hexColorPat = /^#(?:[0-9a-fA-F]{3}){1,2}?$/

function parseInputNumber(part) {
  var m = inputNumberPat.exec(part)
  return m ? +m[1] : 0
}

// used for procDefs
function parseSpec(spec) {
  var parts = spec.split(splitPat).filter(x => !!x)
  var inputs = parts.filter(function(p) {
    return inputPat.test(p)
  })
  return {
    spec: spec,
    parts: parts,
    inputs: inputs,
    hash: hashSpec(spec),
  }
}

function hashSpec(spec) {
  return minifyHash(spec.replace(inputPatGlobal, " _ "))
}

function minifyHash(hash) {
  return hash
    .replace(/_/g, " _ ")
    .replace(/ +/g, " ")
    .replace(/[,%?:]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(". . .", "...")
    .replace(/^…$/, "...")
    .trim()
    .toLowerCase()
}

var blocksBySelector = {}
var blocksBySpec = {}
var allBlocks = scratchCommands.map(function(def) {
  var spec = def.scratch2_spec
  var selector = def.scratch2_selector || ('sb3:' + def.scratch3_selector)

  if (!spec) throw new Error("Missing spec: '" + selector + "'")
  if (!selector) throw new Error("Missing selector: '" + spec + "'")

  var info = {
    selector,
    spec,
    parts: spec.split(splitPat).filter(x => !!x),
    hash: hashSpec(spec),
    inputs: def.inputs,
    shape: def.shape,
    category: def.category,
    hasLoopArrow: !!def.hasLoopArrow,
  }

  // nb. command order matters!
  // Scratch 1.4 blocks are listed last
  if (!blocksBySelector[selector]) blocksBySelector[selector] = info
  return (blocksBySpec[spec] = info)
})

var unicodeIcons = {
  "@greenflag": "⚑",
  "@turnright": "↻",
  "@turnleft": "↺",
  "@addinput": "▸",
  "@delinput": "◂",
}

var allLanguages = {}
function loadLanguage(code, language) {
  var blocksByHash = (language.blocksByHash = {})

  Object.keys(language.commands).forEach(function(spec) {
    var nativeSpec = language.commands[spec]
    var block = blocksBySpec[spec]

    var nativeHash = hashSpec(nativeSpec)
    blocksByHash[nativeHash] = block

    // fallback image replacement, for languages without aliases
    var m = iconPat.exec(spec)
    if (m) {
      var image = m[0]
      var hash = nativeHash.replace(iconPat, image => unicodeIcons[image])
      blocksByHash[hash] = block
    }
  })

  language.nativeAliases = {}
  Object.keys(language.aliases).forEach(function(alias) {
    var spec = language.aliases[alias]
    var block = blocksBySpec[spec]
    if (block === undefined) {
      throw new Error("Invalid alias '" + alias + "'")
    }
    var aliasHash = hashSpec(alias)
    blocksByHash[aliasHash] = block

    language.nativeAliases[spec] = alias
  })

  language.nativeDropdowns = {}
  Object.keys(language.dropdowns).forEach(function(name) {
    var nativeName = language.dropdowns[name]
    language.nativeDropdowns[nativeName] = name
  })

  language.code = code
  allLanguages[code] = language
}
function loadLanguages(languages) {
  Object.keys(languages).forEach(function(code) {
    loadLanguage(code, languages[code])
  })
}

var english = {
  aliases: {
    "turn left %1 degrees": "turn @turnLeft %1 degrees",
    "turn ccw %1 degrees": "turn @turnLeft %1 degrees",
    "turn right %1 degrees": "turn @turnRight %1 degrees",
    "turn cw %1 degrees": "turn @turnRight %1 degrees",
    "when gf clicked": "when @greenFlag clicked",
    "when flag clicked": "when @greenFlag clicked",
    "when green flag clicked": "when @greenFlag clicked",
  },

  define: ["define"],

  // For ignoring the lt sign in the "when distance < _" block
  ignorelt: ["when distance"],

  // Valid arguments to "of" dropdown, for resolving ambiguous situations
  math: [
    "abs",
    "floor",
    "ceiling",
    "sqrt",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "ln",
    "log",
    "e ^",
    "10 ^",
  ],

  // Valid arguments to "sound effect" dropdown, for resolving ambiguous situations
  soundEffects: ["pitch", "pan left/right"],

  // For detecting the "stop" cap / stack block
  osis: ["other scripts in sprite", "other scripts in stage"],

  dropdowns: {},

  commands: {},
}
allBlocks.forEach(function(info) {
  english.commands[info.spec] = info.spec
}),
  loadLanguages({
    en: english,
  })

/*****************************************************************************/

function disambig(selector1, selector2, test) {
  var func = function(info, children, lang) {
    return blocksBySelector[test(children, lang) ? selector1 : selector2]
  }
  blocksBySelector[selector1].specialCase = blocksBySelector[
    selector2
  ].specialCase = func
}

disambig("computeFunction:of:", "getAttribute:of:", function(children, lang) {
  // Operators if math function, otherwise sensing "attribute of" block
  var first = children[0]
  if (!first.isInput) return
  var name = first.value
  return lang.math.indexOf(name) > -1
})

disambig("sb3:SOUND_CHANGEEFFECTBY", "changeGraphicEffect:by:", function(
  children,
  lang
) {
  // Sound if sound effect, otherwise default to graphic effect
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.shape === "dropdown") {
      var name = child.value
      return lang.soundEffects.indexOf(name) > -1
    }
  }
  return false
})

disambig("sb3:SOUND_SETEFFECTO", "setGraphicEffect:to:", function(
  children,
  lang
) {
  // Sound if sound effect, otherwise default to graphic effect
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.shape === "dropdown") {
      var name = child.value
      return lang.soundEffects.indexOf(name) > -1
    }
  }
  return false
})

disambig("lineCountOfList:", "stringLength:", function(children, lang) {
  // List block if dropdown, otherwise operators
  var last = children[children.length - 1]
  if (!last.isInput) return
  return last.shape === "dropdown"
})

disambig("list:contains:", "sb3:OPERATORS_CONTAINS", function(children, lang) {
  // List block if dropdown, otherwise operators
  var first = children[0]
  if (!first.isInput) return
  return first.shape === "dropdown"
})

disambig("penColor:", "setPenHueTo:", function(children, lang) {
  // Color block if color input, otherwise numeric
  var last = children[children.length - 1]
  // If variable, assume color input, since the RGBA hack is common.
  // TODO fix Scratch :P
  return (last.isInput && last.isColor) || last.isBlock
})

blocksBySelector["stopScripts"].specialCase = function(info, children, lang) {
  // Cap block unless argument is "other scripts in sprite"
  var last = children[children.length - 1]
  if (!last.isInput) return
  var value = last.value
  if (lang.osis.indexOf(value) > -1) {
    return Object.assign({}, blocksBySelector["stopScripts"], {
      shape: "stack",
    })
  }
}

function lookupHash(hash, info, children, languages) {
  for (var i = 0; i < languages.length; i++) {
    var lang = languages[i]
    if (lang.blocksByHash.hasOwnProperty(hash)) {
      var block = lang.blocksByHash[hash]
      if (info.shape === "reporter" && block.shape !== "reporter") continue
      if (info.shape === "boolean" && block.shape !== "boolean") continue
      if (block.specialCase) {
        block = block.specialCase(info, children, lang) || block
      }
      return { type: block, lang: lang }
    }
  }
}

function lookupDropdown(name, languages) {
  for (var i = 0; i < languages.length; i++) {
    var lang = languages[i]
    if (lang.nativeDropdowns.hasOwnProperty(name)) {
      var nativeName = lang.nativeDropdowns[name]
      return nativeName
    }
  }
}

function applyOverrides(info, overrides) {
  for (var i = 0; i < overrides.length; i++) {
    var name = overrides[i]
    if (hexColorPat.test(name)) {
      info.color = name
      info.category = ""
      info.categoryIsDefault = false
    } else if (overrideCategories.indexOf(name) > -1) {
      info.category = name
      info.categoryIsDefault = false
    } else if (overrideShapes.indexOf(name) > -1) {
      info.shape = name
    } else if (name === "loop") {
      info.hasLoopArrow = true
    } else if (name === "+" || name === "-") {
      info.diff = name
    }
  }
}

function blockName(block) {
  var words = []
  for (var i = 0; i < block.children.length; i++) {
    var child = block.children[i]
    if (!child.isLabel) return
    words.push(child.value)
  }
  return words.join(" ")
}

module.exports = {
  loadLanguages,

  blockName,

  allLanguages,
  lookupDropdown,
  hexColorPat,
  minifyHash,
  lookupHash,
  applyOverrides,
  rtlLanguages,
  iconPat,
  hashSpec,

  blocksBySelector,
  parseSpec,
  parseInputNumber,
  inputPat,
  unicodeIcons,
  english,
}
