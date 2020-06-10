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
var overrideShapes = [
  "hat",
  "cap",
  "stack",
  "boolean",
  "reporter",
  "ring",
  "cat",
]

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

var blocksById = {}
var blocksBySpec = {}
var allBlocks = scratchCommands.map(function(def) {
  var spec = def.spec
  if (!def.id) {
    if (!def.selector) throw new Error("Missing ID: " + def.spec)
    def.id = "sb2:" + def.selector
  }
  if (!def.spec) throw new Error("Missing spec: " + def.id)

  var info = {
    id: def.id, // Used for Scratch 3 translations
    spec: def.spec, // Used for Scratch 2 translations
    parts: def.spec.split(splitPat).filter(x => !!x),
    selector: def.selector || "sb3:" + def.id, // Used for JSON marshalling
    inputs: def.inputs,
    shape: def.shape,
    category: def.category,
    hasLoopArrow: !!def.hasLoopArrow,
  }
  if (blocksById[info.id]) {
    throw new Error("Duplicate ID: " + info.id)
  }
  blocksById[info.id] = info
  return (blocksBySpec[spec] = info)
})

var unicodeIcons = {
  "@greenFlag": "⚑",
  "@turnRight": "↻",
  "@turnLeft": "↺",
  "@addInput": "▸",
  "@delInput": "◂",
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
      var hash = nativeHash.replace(hashSpec(image), unicodeIcons[image])
      blocksByHash[hash] = block
    }
  })

  language.nativeAliases = {}
  Object.keys(language.aliases).forEach(function(alias) {
    var spec = language.aliases[alias]
    var block = blocksBySpec[spec]
    if (block === undefined) {
      throw new Error("Invalid alias '" + spec + "'")
    }
    var aliasHash = hashSpec(alias)
    blocksByHash[aliasHash] = block

    language.nativeAliases[spec] = alias
  })

  // Some English blocks were renamed between Scratch 2 and Scratch 3. Wire them
  // into language.blocksByHash
  Object.keys(language.renamedBlocks || {}).forEach(function(alt) {
    const id = language.renamedBlocks[alt]
    if (!blocksById[id]) throw new Error("Unknown ID: " + id)
    const block = blocksById[id]
    var hash = hashSpec(alt)
    english.blocksByHash[hash] = block
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

  renamedBlocks: {
    "say %1 for %2 secs": "LOOKS_SAYFORSECS",
    "think %1 for %2 secs": "LOOKS_THINKFORSECS",
    "play sound %1": "SOUND_PLAY",
    "wait %1 secs": "CONTROL_WAIT",
    clear: "pen.clear",
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
})
loadLanguages({
  en: english,
})

/*****************************************************************************/

function specialCase(id, func) {
  if (!blocksById[id]) throw new Error("Unknown ID: " + id)
  blocksById[id].specialCase = func
}

function disambig(id1, id2, test) {
  var func = function(info, children, lang) {
    return blocksById[test(children, lang) ? id1 : id2]
  }
  specialCase(id1, func)
  specialCase(id2, func)
}

disambig("OPERATORS_MATHOP", "SENSING_OF", function(children, lang) {
  // Operators if math function, otherwise sensing "attribute of" block
  var first = children[0]
  if (!first.isInput) return
  var name = first.value
  return lang.math.indexOf(name) > -1
})

disambig("SOUND_CHANGEEFFECTBY", "LOOKS_CHANGEEFFECTBY", function(
  children,
  lang
) {
  // Sound if sound effect, otherwise default to graphic effect
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.shape === "dropdown") {
      var name = child.value
      for (let effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true
        }
      }
    }
  }
  return false
})

disambig("SOUND_SETEFFECTO", "LOOKS_SETEFFECTTO", function(children, lang) {
  // Sound if sound effect, otherwise default to graphic effect
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.shape === "dropdown") {
      var name = child.value
      for (let effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true
        }
      }
    }
  }
  return false
})

disambig("DATA_LENGTHOFLIST", "OPERATORS_LENGTH", function(children, lang) {
  // List block if dropdown, otherwise operators
  var last = children[children.length - 1]
  if (!last.isInput) return
  return last.shape === "dropdown"
})

disambig("DATA_LISTCONTAINSITEM", "OPERATORS_CONTAINS", function(
  children,
  lang
) {
  // List block if dropdown, otherwise operators
  var first = children[0]
  if (!first.isInput) return
  return first.shape === "dropdown"
})

disambig("pen.setColor", "pen.setHue", function(children, lang) {
  // Color block if color input, otherwise numeric
  var last = children[children.length - 1]
  // If variable, assume color input, since the RGBA hack is common.
  // TODO fix Scratch :P
  return (last.isInput && last.isColor) || last.isBlock
})

specialCase("CONTROL_STOP", function(info, children, lang) {
  // Cap block unless argument is "other scripts in sprite"
  var last = children[children.length - 1]
  if (!last.isInput) return
  var value = last.value
  if (lang.osis.indexOf(value) > -1) {
    return Object.assign({}, blocksById["CONTROL_STOP"], {
      shape: "stack",
    })
  }
})

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

  parseSpec,
  parseInputNumber,
  inputPat,
  unicodeIcons,
  english,
  blocksById,
}
