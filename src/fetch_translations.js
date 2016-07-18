#!/usr/bin/env node

/**
 * CONSTANTS
 */

var ALL_LANGS = ['ar', 'an', 'hy', 'ast', 'eu', 'bn_IN', 'nb', 'bg', 'zh_CN',
                 'zh_TW', 'da', 'de', 'eo', 'et', 'fo', 'fi', 'fr',
                 'gl', 'ht', 'he', 'hi', 'hch', 'id', 'ga', 'is', 'it', 'ja',
                 'ja_HIRA', 'km', 'kn', 'kk', 'ca', 'ko', 'hr', 'ku',
                 'cy', 'ky', 'la', 'lv', 'lt', 'mk', 'ms', 'ml', 'mr', 'maz',
                 'mn', 'my', 'nah', 'ne', 'el', 'nl', 'no', 'nn', 'or', 'os',
                 'oto', 'ote', 'pap', 'fa', 'fil', 'pl', 'pt', 'pt_BR', 'ro',
                 'ru', 'rw', 'sv', 'sr', 'sk', 'sl', 'es', 'sw', 'tzm', 'ta',
                 'th', 'cs', 'tr', 'ug', 'uk', 'hu', 'vi'];

var BLACKLIST = ['or'];

// ISO Codes for all the language forums.
var FORUM_LANGS = ['de', 'es', 'fr', 'zh_CN', 'pl', 'ja', 'nl' , 'pt', 'it',
                   'he', 'ko', 'nb', 'tr', 'el', 'ru', 'ca', 'id'];

var ENGLISH_COMMANDS = require('./commands.js');
var COMMAND_SPECS = ENGLISH_COMMANDS.map(cmd => cmd[0]);
var PALETTE_SPECS = [
  'Motion', 'Looks', 'Sound', 'Pen', 'Data', 'variable',
  'list', 'Events', 'Control', 'Sensing', 'Operators',
  'More Blocks', 'Tips'
];
var NEED_ALIAS = [
  'turn @turnRight %n degrees',
  'turn @turnLeft %n degrees',
  'when @greenFlag clicked'
];
var UNTRANSLATED = [
    '%n + %n',
    '%n - %n',
    '%n * %n',
    '%n / %n',
    '%s < %s',
    '%s = %s',
    '%s > %s',
    '…',
    '...'
];
var ACCEPTABLE_MISSING = [
    'username'
];
var MATH_FUNCS = [
  'abs', 'floor', 'ceiling', 'sqrt', 'sin', 'cos', 'tan',
  'asin', 'acos', 'atan', 'ln', 'log', 'e ^', '10 ^'
];
var OSIS = [ 'other scripts in sprite', 'other scripts in stage' ];
var DROPDOWN_SPECS = [
  'A connected', 'all', 'all around',
  'B connected', 'brightness', 'button pressed', 'C connected', 'color',
  'costume name', 'D connected', 'date', 'day of week', 'don\'t rotate',
  'down arrow', 'edge', 'fisheye', 'ghost', 'hour',
  'left arrow', 'left-right', 'light', 'minute', 'month',
  'mosaic', 'motion', 'mouse-pointer',
  'myself', 'off', 'on', 'on-flipped', 'other scripts in sprite',
  'pixelate', 'previous backdrop', 'resistance-A',
  'resistance-B', 'resistance-C', 'resistance-D', 'reverse', 'right arrow',
  'second', 'slider', 'sound', 'space', 'Stage', 'that way', 'this script',
  'this sprite', 'this way', 'up arrow', 'video motion', 'whirl', 'year'
];

/**
 * CONSTANTS END
 */

var fs = require('fs');
var fetch = require('node-fetch');
var values = require('object-values');
var chalk = require('chalk');
var extraAliases = require('./locales/extra_aliases.js');

var args = process.argv;
var BUILD_LANGS = FORUM_LANGS;
if (args.length > 3 || args[2] === '--help') {
  console.log('\nFetches scratch translations from translate.scratch.mit.edu.');
  console.log('\n  Usage: ./fetch_translations.js [language code | all]');
  console.log('\nIf no language code is given, translations for forum languages will be fetched.');
  process.exit(1);
}  else if (args.length === 3 && args[2] === 'all') {
  BUILD_LANGS = ALL_LANGS;
} else if (args.length === 3 && ALL_LANGS.indexOf(args[2]) === -1) {
  console.log('Language code not valid, supported languages:');
  console.log(ALL_LANGS.join(', '));
} else if (args.length === 3) {
  BUILD_LANGS = [ args[2] ];
} // TODO: forum languages only

INSERT_RE = /(%[A-Za-z](?:\.[A-Za-z]+)?)/;
PICTURE_RE = /@[A-Za-z-]+/;
JUNK_RE = /[ \t,\%?:]/;

/**
 * Fetches translations for given language.
 *
 * @parameter lang {string} Which language to fetch.
 * @parameter retry {bool} If this fetch is a retry.
 * @returns {Promise} Resolves with object { lang, blocks, editor }.
 */
function fetchTranslations (lang, retry) {
  var baseUrl = `http://translate.scratch.mit.edu/download/${lang}/`;

  function handleFetch (res) {
    if (!res.ok) {
      throw new Error(`Failed fetching ${res.url} with code ${res.status} ${res.statusText}.`);
    }
    return res.text().then(parsePo);
  }

  var returnObject = {
    lang: lang
    // editor: parsed translations
    // blocks: parsed translations
  };
  return fetch(baseUrl + 'editor/editor.po')
    .then(res => handleFetch(res))
    .then(res => returnObject.editor = res)
    .then(() => fetch(baseUrl + 'blocks/blocks.po'))
    .then(res => handleFetch(res))
    .then(res => returnObject.blocks = res)
    .then(() => returnObject)
    // retry once on failures
    .catch((err) => {
      if (!retry) {
        return fetchTranslations(lang, true);
      }
      throw new Error(`Fetching ${lang} failed: ${err}`);
    });
}

/**
 * Parses a .po file to an object, with msgid => key and msgstr => value.
 *
 * @parameter content {string}
 * @returns {object}
 */
function parsePo (content) {
  var msgId = null;
  var translations = {};
  var lines = content.split('\n');

  lines.forEach(line => {
    if (line.indexOf('msgid ') === 0) {
      msgId = poLineContent(line, 6);
    } else if (line.indexOf('msgstr ') === 0) {
      var msgStr = poLineContent(line, 7);
      if (msgId && msgStr) {
        translations[msgId] = msgStr;
        msgId = null;
      }
    }
  });

  return translations;
}

/**
 * Get values in .po lines. Example:
 *
 * poLineContent('msgid    "the content"  ', 5)
 *   => 'the content'
 *
 * @parameter line {string} The .po line.
 * @parameter strip {int} How many beginning characters to cut.
 * @returns {string}
 */
function poLineContent (line, strip) {
  var ret = line.substr(strip);
  ret = ret.trim();
  ret = ret.replace(/^"(.*)"$/, '$1');
  return ret;
}

/**
 * Add 'end' special case translation to blocks.
 *
 * @parameter fetchedTranslation {object} Return object from `fetchTranslation`.
 * @returns {object} `fetchedTranslation` with 'end' added.
 */
function addEnd (fetchedTranslation) {
  var aliases = extraAliases[fetchedTranslation.lang];
  var end = getEndBlock(aliases);
  if (end) {
    fetchedTranslation.blocks.end = end;
  }
  return fetchedTranslation;
}

/**
 * Get translated "when distance < %n" special case.
 * Needed for ignoring the "<" less than sign in "when distance < %n".
 *
 * @parameter blocks {object} Translation for blocks.
 * @returns {string|null} When distance in language, or null if not translated.
 */
function getWhenDistance (blocks) {
  var whenDistance = blocks['when distance < %n'];
  if (!whenDistance) {
    return null;
  }
  return whenDistance.split(' < %n')[0];
}

/**
 * Get end block from aliases (extra_aliases.js).
 *
 * @parameter aliases {object}
 * @returns {string} End block in given language or empty string if not found.
 */
function getEndBlock (aliases) {
  for (var langSpec in aliases) {
    // spec is equivalent to msgid in .po
    var spec = aliases[langSpec];
    if (spec === 'end') {
      return langSpec;
    }
  }
  return '';
}

/**
 * Prints a warning if language is missing needed aliases (extra_aliases.js).
 *
 * @parameter lang {string}
 * @parameter aliases {object}
 */
function warningMissingAlias (lang, aliases) {
  if (!aliases) {
    console.log(`${lang} is missing all aliases`);
    return;
  }
  var englishSpecs = values(aliases);
  NEED_ALIAS.forEach(alias => {
    if (englishSpecs.indexOf(alias) === -1) {
      console.log(`${lang} is missing "${alias}" translation in extra_translations.js`);
    }
  });
}

/**
 * Translates keywords in `specs` if found in `x` or `y`. Example:
 * Prints a warning if translation for spec is not found.
 *
 * translate('no', ['a', 'b', 'c'], {
 *   // this is x
 *   a: 'preferred'
 * }, {
 *   // this is y
 *   a: 'note preferred',
 *   b: 'translation'
 * })
 *   => { a: 'preferred', b: 'translation' }
 *
 * @parameter lang {string} For the warning message.
 * @parameter specs {array} msgid in .po
 * @parameter x {object} {msgid: msgstr, ...}
 * @parameter [y] {object} Optional.
 * @returns {object} {msgid: msgstr, ...} with msgids from specs array.
 */
function translate (lang, specs, x, y) {
  y = y || {};
  var translations = {}
  specs.forEach(spec => {
    var langSpec = x[spec] || y[spec];
    if (langSpec) {
      translations[spec] = langSpec;
    } else if (UNTRANSLATED.indexOf(spec) === -1 &&
               ACCEPTABLE_MISSING.indexOf(spec) === -1) {
    // translation not found and not acceptable missing -> warn
      console.log(`${lang}: missing translation for "${spec}"`);
    }
  });
  return translations;
}

/**
 * Transforms the translation for scratchblocks consumption.
 *
 * Should contain:
 * - aliases
 * - define
 * - ignorelt (ignore less than)
 * - math
 * - osis
 * - commands
 * - dropdowns
 * - palette
 *
 * @parameter fetchedTranslation {object} `returnObject` from `fetchTranslations`.
 * returns {object}
 */
function buildTranslation (fetchedTranslation) {
  // short hands
  var lang = fetchedTranslation.lang;
  var editor = fetchedTranslation.editor;
  var blocks = fetchedTranslation.blocks;

  var translation = {};
  translation.lang = lang;

  translation.aliases = extraAliases[lang];
  warningMissingAlias(lang, translation.aliases);

  translation.define = [ blocks['define'] || '' ];
  translation.ignorelt = [ getWhenDistance(blocks) ];

  translation.commands = translate(lang, COMMAND_SPECS, blocks);
  translation.dropdowns = translate(lang, DROPDOWN_SPECS, blocks, editor);
  translation.palette = translate(lang, PALETTE_SPECS, blocks, editor);

  translation.math = values(translate(lang, MATH_FUNCS, editor));
  translation.osis = values(translate(lang, OSIS, editor));

  printPercentageTranslated(translation);

  delete translation.blocks;
  delete translation.editor;

  return translation;
}

/**
 * Prints percentage of `translation.commands` found in `COMMAND_SPECS`, except
 * for those in `UNTRANSLATED`.
 */
function printPercentageTranslated (translation) {
  var total = COMMAND_SPECS.filter(cmd => UNTRANSLATED.indexOf(cmd) === -1).length;
  var translated = Object.keys(translation.commands).length;
  var percentage = (translated / total * 100).toFixed(2);
  var color = translated === total ? chalk.green : chalk.red;
  console.log(color(`${translation.lang}: translated ${translated} of ${total}, ${percentage} %`));
}

/**
 * Writes the translations from `buildTranslation` to a JSON file.
 *
 * @parameter translation {object}
 */
function writeJSON (translation) {
  var filename = __dirname + '/locales/' + translation.lang + '.json';
  var content = JSON.stringify(translation, null, 2);
  fs.writeFileSync(filename, content);
}

BUILD_LANGS.map(lang => {
  if (BLACKLIST.indexOf(lang) !== -1) {
    return;
  }
  return fetchTranslations(lang)
    .then(addEnd)
    .then(buildTranslation)
    .then(writeJSON)
    .catch(e => console.error(e))
});
