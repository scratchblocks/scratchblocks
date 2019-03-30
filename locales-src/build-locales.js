const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const PO = require("pofile")
const scratchCommands = require("../syntax/commands")
const extraAliases = require("./extra_aliases")

const localePath =
  "node_modules/scratchr2_translations/legacy/editor/static/locale/"
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

const poToDict = po => {
  const dictionary = {}
  for (let item of po.items) {
    const english = item.msgid
    const result = item.msgstr[0]
    dictionary[english] = result
  }
  return dictionary
}

const parseFile = async poPath => {
  const contents = await readFile(poPath, "utf-8")
  return PO.parse(contents)
}

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
    osis: listFor(osis),
    define: listFor(["define"]),
    palette: dictionaryWith(palette), // used for forum menu
    math: listFor(mathFuncs),
    aliases: aliases || {},

    name: dictionary["Language-Name"],
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

const convertFile = async poPath => {
  const po = await parseFile(poPath)

  const code = po.headers["Language"] || path.basename(poPath, ".po")
  const dictionary = poToDict(po)

  const locale = buildLocale(code, dictionary)
  if (!locale) {
    return
  }

  const teamMatch = /Language-Team: (.*) \(.*/.exec(po)
  if (teamMatch) {
    locale.altName = teamMatch[1]
  }

  const outputPath = path.join("locales", `${code}.json`)
  await writeJSON(outputPath, locale)

  return [code, locale]
}

const filterLocales = (locales, set) => {
  return locales.filter(([code, locale]) => set.has(code))
}

const main = async () => {
  const dir = await readDir(localePath)
  const fileNames = dir.map(n => path.join(localePath, n))
  const locales = await Promise.all(fileNames.map(convertFile))
  const validLocales = locales.filter(x => !!x)

  // check every extra language was used
  const seen = new Set(validLocales.map(([code, locale]) => code))
  for (const code in extraAliases) {
    if (!seen.has(code)) console.error(`extra_aliases: '${code}' not used`)
  }
}

main()
