const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const scratchCommands = require("../syntax/commands")
const blocks = require("../syntax/blocks")
const extraAliases = require("./extra_aliases")

const localeNames = require("scratch-l10n").default
const englishLocale = require("scratch-l10n/editor/blocks/en")

const rawLocales = []
for (let code in localeNames) {
  rawLocales.push({
    code: code,
    mappings: require("scratch-l10n/editor/blocks/" + code),
  })
}

const soundEffects = ["pitch", "pan left/right"]
const osis = ["other scripts in sprite", "other scripts in stage"]
const scratchSelectors = scratchCommands.map(block => block[0])
const palette = [
  "Motion",
  "Looks",
  "Sound",
  "Pen",
  "Data",
  "variables",
  "variable",
  "lists",
  "list",
  "Events",
  "Control",
  "Sensing",
  "Operators",
  "More Blocks",
  "Tips",
]

const forumLangs = [
  "de",
  "es",
  "fr",
  "zh_CN",
  "pl",
  "ja",
  "nl",
  "pt",
  "it",
  "he",
  "ko",
  "nb",
  "tr",
  "el",
  "ru",
  "ca",
  "id",
]

const mathFuncs = [
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
]

const dropdownValues = [
  "A connected",
  "all",
  "all around",
  "all motors",
  "B connected",
  "brightness",
  "button pressed",
  "C connected",
  "color",
  "costume name",
  "D connected",
  "date",
  "day of week",
  "don't rotate",
  "down arrow",
  "edge",
  "everything",
  "fisheye",
  "ghost",
  "hour",
  "left arrow",
  "left-right",
  "light",
  "lights",
  "minute",
  "month",
  "mosaic",
  "motion",
  "motor",
  "motor A",
  "motor B",
  "mouse-pointer",
  "myself",
  "not =",
  "off",
  "on",
  "on-flipped",
  "other scripts in sprite",
  "pixelate",
  "previous backdrop",
  "random position",
  "resistance-A",
  "resistance-B",
  "resistance-C",
  "resistance-D",
  "reverse",
  "right arrow",
  "second",
  "slider",
  "sound",
  "space",
  "Stage",
  "that way",
  "this script",
  "this sprite",
  "this way",
  "up arrow",
  "video motion",
  "whirl",
  "year",
]

const writeJSON = async (outputPath, obj) => {
  const contents = JSON.stringify(obj, null, "  ")
  await writeFile(outputPath, contents, "utf-8")
}

const reverseDict = d => {
  const o = {}
  for (var k in d) {
    o[d[k]] = k
  }
  return o
}

const lookupEachIn = dictionary => items => {
  const output = []
  for (let text of items) {
    const result = dictionary[text]
    if (result && result !== text) {
      output.push(dictionary[text])
    }
  }
  return output
}

const translateEachIn = dictionary => items => {
  const output = {}
  for (let text of items) {
    const result = dictionary[text]
    if (result && result !== text) {
      output[text] = dictionary[text]
    }
  }
  return output
}

const buildLocale = (code, dictionary) => {
  const lookup = k => dictionary[k] || ""
  const listFor = lookupEachIn(dictionary)
  const dictionaryWith = translateEachIn(dictionary)

  const aliases = extraAliases[code]

  const locale = {
    commands: dictionaryWith(scratchSelectors),
    ignorelt: [],
    dropdowns: dictionaryWith(dropdownValues), // used for translate()
    soundEffects: listFor(soundEffects),
    osis: listFor(osis),
    define: listFor(["define"]),
    palette: dictionaryWith(palette), // used for forum menu
    math: listFor(mathFuncs),
    aliases: aliases || {},

    name: localeNames[code].name,
  }

  const commandCount = Object.keys(locale.commands).length
  if (commandCount === 0) {
    return
  }
  const frac = commandCount / scratchSelectors.length
  console.log(
    `${(code + ":").padEnd(8)} ${(frac * 100).toFixed(1).padStart(5)}%`
  )

  // Approximate fraction of blocks translated
  locale.percentTranslated = Math.round(frac / 0.74 * 100)

  if (aliases) {
    locale.commands["end"] = aliases["end"]
  }

  const whenDistance = lookup("when distance < %n")
  if (whenDistance.indexOf(" < %n") !== -1) {
    locale.ignorelt.push(whenDistance.replace(/ \< \%n.*$/))
  }

  for (let block of scratchCommands) {
    const selector = block[0]
    const translation = dictionary[selector]
    if (!translation || translation === selector) {
      continue
    }
    locale.commands[selector] = translation
  }

  return locale
}

const fixup = (key, value) => {
  switch (key) {
    case "EVENT_WHENFLAGCLICKED":
      return value.replace("%1", "@greenFlag")
    case "MOTION_TURNLEFT":
      return value.replace("%1", "@turnLeft")
    case "MOTION_TURNRIGHT":
      return value.replace("%1", "@turnRight")
    case "PROCEDURES_DEFINITION":
      return value.replace(/ ?\%1 ?/, "")
    default:
      return value
  }
}

const makeDictionary = mappings => {
  const dict = {}
  for (let key in mappings) {
    const english = fixup(key, englishLocale[key])
    const translated = fixup(key, mappings[key])
    dict[english] = translated
  }
  return dict
}

const convertFile = async ({ code, mappings }) => {
  const dictionary = makeDictionary(mappings)

  const locale = buildLocale(code, dictionary)
  if (!locale) {
    return
  }

  const outputPath = path.join("locales", `${code}.json`)
  await writeJSON(outputPath, locale)

  return [code, locale]
}

const writeIndex = async codes => {
  let contents = ""
  contents += "module.exports = {\n"
  for (let code of codes) {
    contents += `  ${code.replace(/-/g, "_")}: require("./${code}.json"),\n`
  }
  contents += "}\n"

  const outputPath = path.join("locales", "all.js")
  await writeFile(outputPath, contents, "utf-8")
}

const main = async () => {
  const locales = await Promise.all(rawLocales.map(convertFile))
  const validLocales = locales.filter(x => !!x)

  // check every extra language was used
  const seen = new Set(validLocales.map(([code, locale]) => code))
  for (const code in extraAliases) {
    if (!seen.has(code)) console.error(`extra_aliases: '${code}' not used`)
  }

  const codes = Array.from(seen)
  codes.sort()
  await writeIndex(codes)
}

main()
