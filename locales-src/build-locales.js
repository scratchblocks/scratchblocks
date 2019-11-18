const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const scratchCommands = require('../syntax/commands');
const extraAliases = require('./extra_aliases');

const localeNames = require('scratch-l10n').default;

let english;
const rawLocales = [];
for (const code in localeNames) {
  const raw = {
    code: code,
    mappings: require('scratch-l10n/editor/blocks/' + code),
    extensionMappings: require('scratch-l10n/editor/extensions/' + code),
  };
  if (code === 'en') {
    english = raw;
  } else {
    rawLocales.push(raw);
  }
}

const soundEffects = ['SOUND_EFFECTS_PITCH', 'SOUND_EFFECTS_PAN'];
const osis = ['CONTROL_STOP_OTHER'];
const scratchSpecs = scratchCommands.map(block => block.spec);

const palette = [
  'CATEGORY_MOTION',
  'CATEGORY_LOOKS',
  'CATEGORY_SOUND',
  'CATEGORY_EVENTS',
  'CATEGORY_CONTROL',
  'CATEGORY_SENSING',
  'CATEGORY_OPERATORS',
  'CATEGORY_VARIABLES',
  'CATEGORY_MYBLOCKS',
];

const mathFuncs = [
  'OPERATORS_MATHOP_ABS',
  'OPERATORS_MATHOP_FLOOR',
  'OPERATORS_MATHOP_CEILING',
  'OPERATORS_MATHOP_SQRT',
  'OPERATORS_MATHOP_SIN',
  'OPERATORS_MATHOP_COS',
  'OPERATORS_MATHOP_TAN',
  'OPERATORS_MATHOP_ASIN',
  'OPERATORS_MATHOP_ACOS',
  'OPERATORS_MATHOP_ATAN',
  'OPERATORS_MATHOP_LN',
  'OPERATORS_MATHOP_LOG',
  'OPERATORS_MATHOP_EEXP',
  'OPERATORS_MATHOP_10EXP',
];

const writeJSON = async (outputPath, obj) => {
  const contents = JSON.stringify(obj, null, '  ');
  await writeFile(outputPath, contents, 'utf-8');
};

const translateKey = (raw, key) => {
  const result = raw.mappings[key] || raw.extensionMappings[key];
  const englishResult = english.mappings[key] || english.extensionMappings[key];
  if (!englishResult) {
    throw new Error("Unknown key: '" + key + "'");
  }
  if (!result) return;
  //if (result === englishResult) return
  return fixup(key, result, englishResult);
};

const lookupEachIn = raw => items => {
  const output = [];
  for (const key of items) {
    const result = translateKey(raw, key);
    if (!result) continue;
    output.push(result);
  }
  return output;
};

const translateEachIn = raw => items => {
  const output = {};
  for (const key of items) {
    const result = translateKey(raw, key);
    const englishResult = english.mappings[key];
    if (!result) continue;
    output[englishResult] = result;
  }
  return output;
};

const buildLocale = (code, rawLocale) => {
  const listFor = lookupEachIn(rawLocale);
  const dictionaryWith = translateEachIn(rawLocale);

  const aliases = extraAliases[code];

  const locale = {
    commands: {},
    dropdowns: {},
    ignorelt: [],
    soundEffects: listFor(soundEffects),
    osis: listFor(osis),
    define: listFor(['PROCEDURES_DEFINITION']),
    palette: dictionaryWith(palette), // used for forum menu
    math: listFor(mathFuncs),
    aliases: aliases || {},

    name: localeNames[code].name,
  };

  for (const command of scratchCommands) {
    if (!command.id) continue;
    if (/^sb2:/.test(command.id)) continue;
    if (/^scratchblocks:/.test(command.id)) continue;
    const result = translateKey(rawLocale, command.id);
    if (!result) continue;
    locale.commands[command.spec] = result;
  }

  const commandCount = Object.keys(locale.commands).length;
  if (commandCount === 0) {
    console.log('No blocks: ' + localeNames[code].name);
    return;
  }
  const frac = commandCount / scratchSpecs.length;
  console.log(`${(code + ':').padEnd(8)} ${(frac * 100).toFixed(1).padStart(5)}%`);

  // Approximate fraction of blocks translated
  locale.percentTranslated = Math.round((frac / 0.74) * 100);

  if (aliases) {
    locale.commands['end'] = aliases['end'];
  }

  // TODO does this block still exist?
  //const whenDistance = translateKey("when distance < %1")
  //if (whenDistance.indexOf(" < %1") !== -1) {
  //locale.ignorelt.push(whenDistance.replace(/ \< \%1.*$/))
  //}

  return locale;
};

const fixup = (key, value, englishValue) => {
  let number = 0;
  const variables = {};
  englishValue.replace(/\[[^\]]+\]/g, key => {
    variables[key] = '%' + ++number;
  });

  value = value.replace(/\[[^\]]+\]/g, key => variables[key]);
  value = value.trim();
  if (!value) return;

  switch (key) {
    case 'EVENT_WHENFLAGCLICKED':
      return value.replace('%1', '@greenFlag');
    case 'MOTION_TURNLEFT':
      return value.replace('%1', '@turnLeft').replace('%2', '%1');
    case 'MOTION_TURNRIGHT':
      return value.replace('%1', '@turnRight').replace('%2', '%1');
    case 'PROCEDURES_DEFINITION':
      return value.replace(/ ?%1 ?/, '');
    case 'CONTROL_STOP':
      return value + ' %1';
    default:
      return value;
  }
};

const convertFile = async rawLocale => {
  const code = rawLocale.code;
  const locale = buildLocale(code, rawLocale);
  if (!locale) {
    return;
  }

  const outputPath = path.join('locales', `${code}.json`);
  await writeJSON(outputPath, locale);

  return [code, locale];
};

const writeIndex = async codes => {
  let contents = '';
  contents += 'module.exports = {\n';
  for (const code of codes) {
    contents += `  ${code.replace(/-/g, '_')}: require("./${code}.json"),\n`;
  }
  contents += '}\n';

  const outputPath = path.join('locales', 'all.js');
  await writeFile(outputPath, contents, 'utf-8');
};

const main = async () => {
  const locales = await Promise.all(rawLocales.map(convertFile));
  const validLocales = locales.filter(x => !!x);

  // check every extra language was used
  const seen = new Set(validLocales.map(([code]) => code));
  for (const code in extraAliases) {
    if (!seen.has(code)) console.error(`extra_aliases: '${code}' not used`);
  }

  const codes = Array.from(seen);
  codes.sort();
  await writeIndex(codes);
};

main();
