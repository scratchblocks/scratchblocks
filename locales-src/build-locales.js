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

const soundEffects = [
  "SOUND_EFFECTS_PITCH",
  "SOUND_EFFECTS_PAN",
]
const osis = [
  "CONTROL_STOP_OTHER",
]
const scratchSpecs = scratchCommands.map(block => block.spec)

const palette = [
  "CATEGORY_MOTION",
  "CATEGORY_LOOKS",
  "CATEGORY_SOUND",
  "CATEGORY_EVENTS",
  "CATEGORY_CONTROL",
  "CATEGORY_SENSING",
  "CATEGORY_OPERATORS",
  "CATEGORY_VARIABLES",
  "CATEGORY_MYBLOCKS",
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
  "OPERATORS_MATHOP_ABS",
  "OPERATORS_MATHOP_FLOOR",
  "OPERATORS_MATHOP_CEILING",
  "OPERATORS_MATHOP_SQRT",
  "OPERATORS_MATHOP_SIN",
  "OPERATORS_MATHOP_COS",
  "OPERATORS_MATHOP_TAN",
  "OPERATORS_MATHOP_ASIN",
  "OPERATORS_MATHOP_ACOS",
  "OPERATORS_MATHOP_ATAN",
  "OPERATORS_MATHOP_LN",
  "OPERATORS_MATHOP_LOG",
  "OPERATORS_MATHOP_EEXP",
  "OPERATORS_MATHOP_10EXP",
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

const translateKey = (mappings, key) => {
  const result = mappings[key]
  if (!result) return
  const englishResult = englishLocale[key]
  if (result === englishResult) return
  return fixup(key, result)
}

const lookupEachIn = dictionary => items => {
  const output = []
  for (let key of items) {
    const result = translateKey(dictionary, key)
    if (!result) continue
    output.push(result)
  }
  return output
}

const translateEachIn = dictionary => items => {
  const output = {}
  for (let key of items) {
    const result = translateKey(dictionary, key)
    const englishResult = englishLocale[key]
    if (!result) continue
    output[englishResult] = result
  }
  return output
}

const buildLocale = (code, mappings) => {
  const lookup = k => mappings[k] || ""
  const listFor = lookupEachIn(mappings)
  const dictionaryWith = translateEachIn(mappings)

  const aliases = extraAliases[code]

  const locale = {
    commands: {},
    ignorelt: [],
    soundEffects: listFor(soundEffects),
    osis: listFor(osis),
    define: listFor(["PROCEDURES_DEFINITION"]),
    palette: dictionaryWith(palette), // used for forum menu
    math: listFor(mathFuncs),
    aliases: aliases || {},

    name: localeNames[code].name,
  }

  for (let command of scratchCommands) {
    const result = translateKey(mappings, command.scratch3_selector)
    if (!result) continue
    locale.commands[command.scratch2_spec] = result
  }

  const commandCount = Object.keys(locale.commands).length
  if (commandCount === 0) {
    return
  }
  const frac = commandCount / scratchSpecs.length
  console.log(
    `${(code + ":").padEnd(8)} ${(frac * 100).toFixed(1).padStart(5)}%`
  )

  // Approximate fraction of blocks translated
  locale.percentTranslated = Math.round(frac / 0.74 * 100)

  if (aliases) {
    locale.commands["end"] = aliases["end"]
  }

  const whenDistance = lookup("when distance < %1")
  if (whenDistance.indexOf(" < %1") !== -1) {
    locale.ignorelt.push(whenDistance.replace(/ \< \%1.*$/))
  }

  return locale
}

const fixup = (key, value) => {
  switch (key) {
    case "EVENT_WHENFLAGCLICKED":
      return value.replace("%1", "@greenFlag")
    case "MOTION_TURNLEFT":
      return value.replace("%1", "@turnLeft").replace("%2", "%1")
    case "MOTION_TURNRIGHT":
      return value.replace("%1", "@turnRight").replace("%2", "%1")
    case "PROCEDURES_DEFINITION":
      return value.replace(/ ?\%1 ?/, "")
    default:
      return value
  }
}

const convertFile = async ({ code, mappings }) => {
  const locale = buildLocale(code, mappings)
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
