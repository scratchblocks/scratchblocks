import { extensions, aliasExtensions } from "./extensions.js"

// List of classes we're allowed to override.

const overrideCategories = [
  "motion",
  "looks",
  "sound",
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
  ...Object.keys(extensions),
  ...Object.keys(aliasExtensions),
]

const overrideShapes = [
  "hat",
  "cap",
  "stack",
  "boolean",
  "reporter",
  "ring",
  "cat",
]

// languages that should be displayed right to left
export const rtlLanguages = ["ar", "ckb", "fa", "he"]

// List of commands taken from Scratch
import scratchCommands from "./commands.js"
import {
  getDropdowns as getScratchDropdowns,
  getMakeyMakeySequenceDropdowns,
} from "./dropdowns.js"

const inputNumberPat = /%([0-9]+)/
export const inputPat = /(%[a-zA-Z0-9](?:\.[a-zA-Z0-9]+)?)/
const inputPatGlobal = new RegExp(inputPat.source, "g")
export const iconPat = /(@[a-zA-Z]+)/
const splitPat = new RegExp(`${inputPat.source}|${iconPat.source}| +`, "g")

export const hexColorPat = /^#(?:[0-9a-fA-F]{3}){1,2}?$/

export function parseInputNumber(part) {
  const m = inputNumberPat.exec(part)
  return m ? +m[1] : 0
}

// used for procDefs
export function parseSpec(spec) {
  const parts = spec.split(splitPat).filter(x => x)
  const inputs = parts.filter(p => inputPat.test(p))
  return { spec: spec, parts: parts, inputs: inputs, hash: hashSpec(spec) }
}

export function hashSpec(spec) {
  return minifyHash(spec.replace(inputPatGlobal, " _ "))
}

export function minifyHash(hash) {
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

export const blocksById = {}
const allBlocks = scratchCommands.map(def => {
  if (!def.id) {
    if (!def.selector) {
      throw new Error(`Missing ID: ${def.spec}`)
    }
    def.id = `sb2:${def.selector}`
  }
  if (!def.spec) {
    throw new Error(`Missing spec: ${def.id}`)
  }

  const info = {
    id: def.id, // Used for Scratch 3 translations
    spec: def.spec, // Used for Scratch 2 translations
    parts: def.spec.split(splitPat).filter(x => x),
    selector: def.selector || `sb3:${def.id}`, // Used for JSON marshalling
    inputs: def.inputs == null ? [] : def.inputs,
    shape: def.shape,
    category: def.category,
    hasLoopArrow: !!def.hasLoopArrow,
  }
  if (blocksById[info.id]) {
    throw new Error(`Duplicate ID: ${info.id}`)
  }
  blocksById[info.id] = info
  return info
})

export const unicodeIcons = {
  "@greenFlag": "⚑",
  "@turnRight": "↻",
  "@turnLeft": "↺",
  "@addInput": "▸",
  "@delInput": "◂",
}

export const allLanguages = {}
function loadLanguage(code, language) {
  const blocksByHash = (language.blocksByHash = {})

  Object.keys(language.commands).forEach(blockId => {
    const nativeSpec = language.commands[blockId]
    const block = blocksById[blockId]

    const nativeHash = hashSpec(nativeSpec)
    if (!blocksByHash[nativeHash]) {
      blocksByHash[nativeHash] = []
    }
    blocksByHash[nativeHash].push(block)

    // fallback image replacement, for languages without aliases
    const m = iconPat.exec(block.spec)
    if (m) {
      const image = m[0]
      const hash = nativeHash.replace(hashSpec(image), unicodeIcons[image])
      if (!blocksByHash[hash]) {
        blocksByHash[hash] = []
      }
      blocksByHash[hash].push(block)
    }
  })

  language.nativeAliases = {}
  Object.keys(language.aliases).forEach(alias => {
    const blockId = language.aliases[alias]
    const block = blocksById[blockId]
    if (block === undefined) {
      throw new Error(`Invalid alias '${blockId}'`)
    }
    const aliasHash = hashSpec(alias)
    if (!blocksByHash[aliasHash]) {
      blocksByHash[aliasHash] = []
    }
    blocksByHash[aliasHash].push(block)

    if (!language.nativeAliases[blockId]) {
      language.nativeAliases[blockId] = []
    }
    language.nativeAliases[blockId].push(alias)
  })

  // Some English blocks were renamed between Scratch 2 and Scratch 3. Wire them
  // into language.blocksByHash
  Object.keys(language.renamedBlocks || {}).forEach(alt => {
    const id = language.renamedBlocks[alt]
    if (!blocksById[id]) {
      throw new Error(`Unknown ID: ${id}`)
    }
    const block = blocksById[id]
    const hash = hashSpec(alt)
    if (!english.blocksByHash[hash]) {
      english.blocksByHash[hash] = []
    }
    english.blocksByHash[hash].push(block)
  })

  language.nativeDropdowns = {}
  Object.keys(language.dropdowns).forEach(name => {
    const nativeName = language.dropdowns[name].value
    const parents = language.dropdowns[name].parents
    if (!language.nativeDropdowns[nativeName]) {
      language.nativeDropdowns[nativeName] = []
    }
    language.nativeDropdowns[nativeName].push({ id: name, parents: parents })
  })

  language.code = code
  allLanguages[code] = language
}
export function loadLanguages(languages) {
  Object.keys(languages).forEach(code => loadLanguage(code, languages[code]))
}

export const english = {
  aliases: {
    "turn ccw %1 degrees": "MOTION_TURNLEFT",
    "turn left %1 degrees": "MOTION_TURNLEFT",
    "turn cw %1 degrees": "MOTION_TURNRIGHT",
    "turn right %1 degrees": "MOTION_TURNRIGHT",
    "when flag clicked": "EVENT_WHENFLAGCLICKED",
    "when gf clicked": "EVENT_WHENFLAGCLICKED",
    "when green flag clicked": "EVENT_WHENFLAGCLICKED",
  },

  renamedBlocks: {
    "say %1 for %2 secs": "LOOKS_SAYFORSECS",
    "think %1 for %2 secs": "LOOKS_THINKFORSECS",
    "play sound %1": "SOUND_PLAY",
    "wait %1 secs": "CONTROL_WAIT",
    clear: "pen.clear",
  },

  definePrefix: ["define"],
  defineSuffix: [],

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

  // Language name is needed for the English locale as well
  name: "English",

  // Valid arguments to "sound effect" dropdown, for resolving ambiguous situations
  soundEffects: ["pitch", "pan left/right"],

  // Valid arguments to "microbit when" dropdown
  microbitWhen: ["moved", "shaken", "jumped"],

  // For detecting the "stop" cap / stack block
  osis: ["other scripts in sprite", "other scripts in stage"],

  dropdowns: {},

  commands: {},
}
allBlocks.forEach(info => {
  english.commands[info.id] = info.spec
})
getScratchDropdowns().forEach(info => {
  english.dropdowns[info.id] = {
    value: info.value,
    parents: info.parents || [],
  }
})
english.dropdowns = {
  ...english.dropdowns,
  ...getMakeyMakeySequenceDropdowns(english.dropdowns),
  "translate.language.am": {
    value: "Amharic",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ar": {
    value: "Arabic",
    parents: ["translate.translateBlock"],
  },
  "translate.language.az": {
    value: "Azerbaijani",
    parents: ["translate.translateBlock"],
  },
  "translate.language.eu": {
    value: "Basque",
    parents: ["translate.translateBlock"],
  },
  "translate.language.bg": {
    value: "Bulgarian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ca": {
    value: "Catalan",
    parents: ["translate.translateBlock"],
  },
  "translate.language.zh-cn": {
    value: "Chinese (Simplified)",
    parents: ["translate.translateBlock"],
  },
  "translate.language.zh-tw": {
    value: "Chinese (Traditional)",
    parents: ["translate.translateBlock"],
  },
  "translate.language.hr": {
    value: "Croatian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.cs": {
    value: "Czech",
    parents: ["translate.translateBlock"],
  },
  "translate.language.da": {
    value: "Danish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.nl": {
    value: "Dutch",
    parents: ["translate.translateBlock"],
  },
  "translate.language.en": {
    value: "English",
    parents: ["translate.translateBlock"],
  },
  "translate.language.et": {
    value: "Estonian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.fi": {
    value: "Finnish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.fr": {
    value: "French",
    parents: ["translate.translateBlock"],
  },
  "translate.language.gl": {
    value: "Galician",
    parents: ["translate.translateBlock"],
  },
  "translate.language.de": {
    value: "German",
    parents: ["translate.translateBlock"],
  },
  "translate.language.el": {
    value: "Greek",
    parents: ["translate.translateBlock"],
  },
  "translate.language.he": {
    value: "Hebrew",
    parents: ["translate.translateBlock"],
  },
  "translate.language.hu": {
    value: "Hungarian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.is": {
    value: "Icelandic",
    parents: ["translate.translateBlock"],
  },
  "translate.language.id": {
    value: "Indonesian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ga": {
    value: "Irish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.it": {
    value: "Italian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ja": {
    value: "Japanese",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ko": {
    value: "Korean",
    parents: ["translate.translateBlock"],
  },
  "translate.language.lv": {
    value: "Latvian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.lt": {
    value: "Lithuanian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.mi": {
    value: "Maori",
    parents: ["translate.translateBlock"],
  },
  "translate.language.nb": {
    value: "Norwegian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.fa": {
    value: "Persian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.pl": {
    value: "Polish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.pt": {
    value: "Portuguese",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ro": {
    value: "Romanian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.ru": {
    value: "Russian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.gd": {
    value: "Scots Gaelic",
    parents: ["translate.translateBlock"],
  },
  "translate.language.sr": {
    value: "Serbian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.sk": {
    value: "Slovak",
    parents: ["translate.translateBlock"],
  },
  "translate.language.sl": {
    value: "Slovenian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.es": {
    value: "Spanish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.sv": {
    value: "Swedish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.th": {
    value: "Thai",
    parents: ["translate.translateBlock"],
  },
  "translate.language.tr": {
    value: "Turkish",
    parents: ["translate.translateBlock"],
  },
  "translate.language.uk": {
    value: "Ukrainian",
    parents: ["translate.translateBlock"],
  },
  "translate.language.vi": {
    value: "Vietnamese",
    parents: ["translate.translateBlock"],
  },
  "translate.language.cy": {
    value: "Welsh",
    parents: ["translate.translateBlock"],
  },
  "translate.language.zu": {
    value: "Zulu",
    parents: ["translate.translateBlock"],
  },
  "text2speech.language.ar": {
    value: "Arabic",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.zh-cn": {
    value: "Chinese (Mandarin)",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.da": {
    value: "Danish",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.nl": {
    value: "Dutch",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.en": {
    value: "English",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.fr": {
    value: "French",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.de": {
    value: "German",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.hi": {
    value: "Hindi",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.is": {
    value: "Icelandic",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.it": {
    value: "Italian",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.ja": {
    value: "Japanese",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.ko": {
    value: "Korean",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.nb": {
    value: "Norwegian",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.pl": {
    value: "Polish",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.pt-br": {
    value: "Portuguese (Brazilian)",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.pt": {
    value: "Portuguese",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.ro": {
    value: "Romanian",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.ru": {
    value: "Russian",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.es": {
    value: "Spanish",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.es-419": {
    value: "Spanish (Latin American)",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.sv": {
    value: "Swedish",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.tr": {
    value: "Turkish",
    parents: ["text2speech.setLanguageBlock"],
  },
  "text2speech.language.cy": {
    value: "Welsh",
    parents: ["text2speech.setLanguageBlock"],
  },
}
loadLanguages({ en: english })

/*****************************************************************************/

function registerCheck(id, func) {
  if (!blocksById[id]) {
    throw new Error(`Unknown ID: ${id}`)
  }
  blocksById[id].accepts = func
}

function specialCase(id, func) {
  if (!blocksById[id]) {
    throw new Error(`Unknown ID: ${id}`)
  }
  blocksById[id].specialCase = func
}

function disambig(id1, id2, test) {
  registerCheck(id1, (_, children, lang) => {
    return test(children, lang)
  })
  registerCheck(id2, (_, children, lang) => {
    return !test(children, lang)
  })
}

disambig("OPERATORS_MATHOP", "SENSING_OF", (children, lang) => {
  // Operators if math function, otherwise sensing "attribute of" block
  const first = children[0]
  if (!first.isInput) {
    return
  }
  const name = first.value
  return lang.math.includes(name)
})

disambig("SOUND_CHANGEEFFECTBY", "LOOKS_CHANGEEFFECTBY", (children, lang) => {
  // Sound if sound effect, otherwise default to graphic effect
  for (const child of children) {
    if (child.shape === "dropdown") {
      const name = child.value
      for (const effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true
        }
      }
    }
  }
  return false
})

disambig("SOUND_SETEFFECTO", "LOOKS_SETEFFECTTO", (children, lang) => {
  // Sound if sound effect, otherwise default to graphic effect
  for (const child of children) {
    if (child.shape === "dropdown") {
      const name = child.value
      for (const effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true
        }
      }
    }
  }
  return false
})

disambig("DATA_LENGTHOFLIST", "OPERATORS_LENGTH", (children, _lang) => {
  // List block if dropdown, otherwise operators
  const last = children[children.length - 1]
  if (!last.isInput) {
    return
  }
  return last.shape === "dropdown"
})

disambig("DATA_LISTCONTAINSITEM", "OPERATORS_CONTAINS", (children, _lang) => {
  // List block if dropdown, otherwise operators
  const first = children[0]
  if (!first.isInput) {
    return
  }
  return first.shape === "dropdown"
})

disambig("pen.setColor", "pen.setHue", (children, _lang) => {
  // Color block if color input, otherwise numeric
  const last = children[children.length - 1]
  // If variable, assume color input, since the RGBA hack is common.
  // TODO fix Scratch :P
  return (last.isInput && last.isColor) || last.isBlock
})

disambig("microbit.whenGesture", "gdxfor.whenGesture", (children, lang) => {
  for (const child of children) {
    if (child.shape === "dropdown") {
      const name = child.value
      // Yes, "when shaken" gdxfor block exists. But microbit is more common.
      for (const effect of lang.microbitWhen) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true
        }
      }
    }
  }
  return false
})

// This block does not need disambiguation in English;
// however, many other languages do require that.
disambig("ev3.buttonPressed", "microbit.isButtonPressed", (children, _lang) => {
  for (const child of children) {
    if (child.shape === "dropdown") {
      // EV3 "button pressed" block uses numeric identifier
      // and does not support "any".
      switch (minifyHash(child.value)) {
        case "1":
        case "2":
        case "3":
        case "4":
          return true
        default:
      }
    }
  }
  return false
})

specialCase("CONTROL_STOP", (_, children, lang) => {
  // Cap block unless argument is "other scripts in sprite"
  const last = children[children.length - 1]
  if (!last.isInput) {
    return
  }
  const value = last.value
  if (lang.osis.includes(value)) {
    return { ...blocksById.CONTROL_STOP, shape: "stack" }
  }
})

function narrowByNativeDropdowns(collisions, children, languages) {
  const dropdownValues = []
  for (const child of children) {
    if (!child) {
      continue
    }
    const shape = child.shape || ""
    if (shape.endsWith("dropdown") || shape === "dropdown") {
      if (child.value != null) {
        dropdownValues.push(child.value)
      }
    }
  }
  if (!dropdownValues.length) {
    return collisions
  }

  // Preprocess: build a map value -> concatenated list of dropdown entry strings
  const valueEntriesMap = new Map()
  for (const lang of languages) {
    for (const val of dropdownValues) {
      if (
        lang.nativeDropdowns &&
        Object.prototype.hasOwnProperty.call(lang.nativeDropdowns, val)
      ) {
        const arr = lang.nativeDropdowns[val]
        if (arr && arr.length) {
          if (!valueEntriesMap.has(val)) {
            valueEntriesMap.set(val, [])
          }
          // arr: [{ id, parents }] ; merge (keep duplicates harmless)
          valueEntriesMap.get(val).push(...arr)
        }
      }
    }
  }
  if (!valueEntriesMap.size) {
    return collisions
  }

  const filtered = collisions.filter(block => {
    const candidates = [
      block.id,
      block.selector && block.selector.replace(/^sb3:/, ""),
      block.selector,
    ].filter(Boolean)
    for (const entries of valueEntriesMap.values()) {
      for (const entry of entries) {
        if (!entry) {
          continue
        }
        // entry can be { id, parents } per loadLanguage(); parents may be undefined
        const parents = Array.isArray(entry.parents) ? entry.parents : []
        // If any parent matches the block id/selector, keep it
        if (parents.some(p => candidates.includes(p))) {
          return true
        }
        // Fallback: some (older) data could have stored id as parent indicator
        if (entry.id && candidates.includes(entry.id)) {
          return true
        }
      }
    }
    return false
  })
  return filtered.length ? filtered : collisions
}

export function lookupHash(hash, info, children, languages, overrides) {
  for (const lang of languages) {
    if (Object.prototype.hasOwnProperty.call(lang.blocksByHash, hash)) {
      let collisions = lang.blocksByHash[hash]

      if (overrides && overrides.length) {
        // 1) Highest priority: If a value in overrides matches a category in collisions uniquely, return it directly
        const collisionCategories = new Set(
          collisions.map(b => b.category).filter(Boolean),
        )
        for (const o of overrides) {
          if (!o) {
            continue
          }
          // Only process if the override appears in the current collision category set
          if (collisionCategories.has(o)) {
            const matching = collisions.filter(b => b.category === o)
            if (matching.length === 1) {
              const block = matching[0]
              // Keep shape filtering consistent with subsequent logic
              if (
                (info.shape === "reporter" &&
                  block.shape !== "reporter" &&
                  block.shape !== "ring") ||
                (info.shape === "boolean" && block.shape !== "boolean")
              ) {
                // If the shape is incompatible, do not break, continue to try other overrides
              } else {
                return { type: block, lang: lang }
              }
            } else if (matching.length > 1) {
              // Multiple same categories, narrow down the collision range, continue further refinement
              collisions = matching
              break
            }
          }
        }

        // 2) Secondary: Use the original mechanism, identify the first override in the allowed override category list
        const categoryOverride = overrides.find(o =>
          overrideCategories.includes(o),
        )
        if (categoryOverride) {
          const filtered = collisions.filter(
            b => b.category === categoryOverride,
          )
          if (filtered.length) {
            // If only one remains, return it directly; otherwise, continue normal disambiguation
            if (filtered.length === 1) {
              return { type: filtered[0], lang: lang }
            }
            collisions = filtered
          }
        }
      }

      // Try to narrow down the collision set using nativeDropdowns
      if (collisions.length > 1) {
        collisions = narrowByNativeDropdowns(collisions, children, languages)
      }

      for (let block of collisions) {
        if (
          info.shape === "reporter" &&
          block.shape !== "reporter" &&
          block.shape !== "ring"
        ) {
          continue
        }
        if (info.shape === "boolean" && block.shape !== "boolean") {
          continue
        }
        if (collisions.length > 1) {
          // Only check in case of collision;
          // perform "disambiguation"
          if (block.accepts && !block.accepts(info, children, lang)) {
            continue
          }
        }
        if (block.specialCase) {
          block = block.specialCase(info, children, lang) || block
        }
        return { type: block, lang: lang }
      }
    }
  }
}

export function lookupDropdown(name, parentType, languages) {
  for (const lang of languages) {
    if (Object.prototype.hasOwnProperty.call(lang.nativeDropdowns, name)) {
      const objs = lang.nativeDropdowns[name]
      for (const { id, parents } of objs) {
        if (parents.includes(parentType)) {
          return id
        }
      }
    }
  }
}

export function applyOverrides(info, overrides) {
  for (const name of overrides) {
    if (hexColorPat.test(name)) {
      info.color = name
      info.category = ""
      info.categoryIsDefault = false
    } else if (overrideCategories.includes(name)) {
      info.category = name
      info.categoryIsDefault = false
    } else if (overrideShapes.includes(name)) {
      info.shape = name
    } else if (name === "loop") {
      info.hasLoopArrow = true
    } else if (name === "+" || name === "-") {
      info.diff = name
    }
  }
}

export function blockName(block) {
  const words = []
  for (const child of block.children) {
    if (!child.isLabel) {
      return
    }
    words.push(child.value)
  }
  return words.join(" ")
}
