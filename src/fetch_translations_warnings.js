#!/usr/bin/env node

var fs = require('fs');
var fetch = require('node-fetch');
var objectValues = require('object-values');
var extraTranslations = require('./locales/extra_translations.js');

var ALL_LANGS = ['ar', 'an', 'hy', 'ast', 'eu', 'bn_IN', 'nb', 'bg', 'zh_CN',
                 'zh_TW', 'da', 'de', 'eo', 'et', 'fo', 'fi', 'fr', 'fr_CA',
                 'gl', 'ht', 'he', 'hi', 'hch', 'id', 'ga', 'is', 'it', 'ja',
                 'ja_hr', 'ja_HIRA', 'km', 'kn', 'kk', 'ca', 'ko', 'hr', 'ku',
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
  'Motion', 'Looks', 'Sound', 'Pen', 'Data', 'variables', 'variable',
  'lists', 'list', 'Events', 'Control', 'Sensing', 'Operators',
  'More Blocks', 'Tips'
];
var NEED_ALIAS = [
  'turn @turnRight %n degrees',
  'turn @turnLeft %n degrees',
  'when @greenFlag clicked',
  'end'
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
  'A connected', 'all', 'all around', 'all motors',
  'B connected', 'brightness', 'button pressed', 'C connected', 'color',
  'costume name', 'D connected', 'date', 'day of week', 'don\'t rotate',
  'down arrow', 'edge', 'everything', 'fisheye', 'ghost', 'hour',
  'left arrow', 'left-right', 'light', 'lights', 'minute', 'month',
  'mosaic', 'motion', 'motor', 'motor A', 'motor B', 'mouse-pointer',
  'myself', 'not =', 'off', 'on', 'on-flipped', 'other scripts in sprite',
  'pixelate', 'previous backdrop', 'random position', 'resistance-A',
  'resistance-B', 'resistance-C', 'resistance-D', 'reverse', 'right arrow',
  'second', 'slider', 'sound', 'space', 'Stage', 'that way', 'this script',
  'this sprite', 'this way', 'up arrow', 'video motion', 'whirl', 'year'
];

var args = process.argv;
if (args.length > 3 || args[2] === '--help') {
  console.log('\nFetches scratch translations from translate.scratch.mit.edu.');
  console.log('\n  Usage: ./fetch_translations.js [language code]');
  console.log('\nIf no language code is given, all translations will be fetched.');
  process.exit(1);
} else if (args.length === 3 && ALL_LANGS.indexOf(args[2]) === -1) {
  console.log('Language code not valid, supported languages:');
  console.log(ALL_LANGS.join(', '));
} else if (args.length === 3) {
  ALL_LANGS = [ args[2] ];
} // TODO: forum languages only

INSERT_RE = /(%[A-Za-z](?:\.[A-Za-z]+)?)/;
PICTURE_RE = /@[A-Za-z-]+/;
JUNK_RE = /[ \t,\%?:]/;

/**
 * Fetches translations for given language.
 *
 * @parameter lang {string} Which language to fetch.
 * @returns {Promise} Resolves with object { lang, blocks, editor }.
 */
function fetchTranslations (lang) {
  var baseUrl = `http://translate.scratch.mit.edu/download/${lang}/`;
  console.log(`Fetching ${lang}...`);

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
  return fetch(baseUrl + 'editor/editor.po', { timeout: 1000 })
    .then(res => handleFetch(res))
    .then(res => returnObject.editor = res)
    .then(() => fetch(baseUrl + 'blocks/blocks.po'))
    .then(res => handleFetch(res))
    .then(res => returnObject.blocks = res)
    .then(() => returnObject)
}

/**
 * Parses a .po file to an object, with msgid => key and msgstr => value.
 * Warns if some of the translations are missing.
 *
 * @parameter content {string}
 * @returns {object}
 */
function parsePo (content) {
  if (typeof content !== 'string') {
    throw new Error(`In parsePo, content '${content}' not a string.`);
  }

  var lang;
  var total = 0;
  var missing = 0;
  var msgId = null;
  var translations = {};
  var lines = content.split('\n');

  lines.forEach(line => {
    if (line.indexOf('"Language: ') === 0) {
      // keep language for warnings
      lang = line.match(/Language: ([^\\]+)/)[1];
    } else if (line.indexOf('msgid ') === 0) {
      msgId = poLineContent(line, 6);
      if (msgId) {
        total += 1;
      }
    } else if (line.indexOf('msgstr ') === 0) {
      var msgStr = poLineContent(line, 7);
      if (msgId && msgStr) {
        translations[msgId] = msgStr;
        msgId = null;
      } else if (msgId && !msgStr) {
        /**
         * Warn when missing translation. Pattern:
         * msgid "Translate me"
         * msgstr ""
         */
        console.log(`Warning: ${lang} is missing translation for "${msgId}"`);
        missing += 1;
      }
    }
  });

  if (missing) {
    console.log(`${lang}: ${missing} missing of ${total}.`);
  }

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
 * Prints percentage of `translation.commands` found in `COMMAND_SPECS`, except
 * for those in `UNTRANSLATED`.
 */
function printPercentageTranslated (translation) {
  var total = COMMAND_SPECS.reduce((count, cmd) => {
    if (UNTRANSLATED.indexOf(cmd) !== -1) {
      // these are not translated in any language
      return count;
    }
    return count + 1;
  }, 0);
  var translated = Object.keys(translation.commands).length;
  var percentage = translated / total * 100;
  console.log(`${translation.lang}: translated ${percentage}%`);
}

/**
 * Get translated "when distance < %n" special case.
 * Needed for ignoring the "<" less than sign in "when distance < %n".
 *
 * @parameter blocks {object} Translation for blocks.
 * @returns {string} When distance in language, or empty string if not translated.
 */
function getWhenDistance (blocks) {
  var when_distance = blocks['when distance < %n'];
  if (!when_distance) {
    return '';
  }
  return when_distance.split(' < %n')[0];
}

/**
 * Get end block for given language.
 *
 * @parameter lang {string}
 * @returns {string} End block in given language or empty string if not found.
 */
function getEndBlock (lang) {
  var translations = extraTranslations[lang];
  for (var langSpec in translations) {
    var spec = translations[langSpec];
    if (spec === 'end') {
      return langSpec;
    }
  }
  return '';
}

/**
 * Prints a warning if language is missing needed aliases.
 *
 * @parameter lang {string}
 */
function warningMissingExtra (lang) {
  // TODO: switch key <-> val in extra_translations.js ?
  var englishSpecs = objectValues(extraTranslations[lang]);
  NEED_ALIAS.forEach(alias => {
    if (englishSpecs.indexOf(alias) === -1) {
      console.log(`${lang} is missing "${alias}" translation in extra_translations.js`);
    }
  });
}

/**
 * Translates keywords in `specs` if found in `x` or `y`. Example:
 *
 * translate(['a', 'b', 'c'], {
 *   // this is x
 *   a: 'preferred'
 * }, {
 *   // this is y
 *   a: 'note preferred',
 *   b: 'translation'
 * })
 *   => { a: 'preferred', b: 'translation' }
 *
 * @parameter specs [array]
 * @parameter x {object}
 * @parameter [y] {object} Optional.
 * @returns {object}
 */
function translate (specs, x, y) {
  y = y || {};
  var translations = {}
  specs.forEach(spec => {
    var langSpec = x[spec] || y[spec];
    if (langSpec) {
      translations[spec] = langSpec;
    }
  });
  return translations;
}

/**
 * Transforms the translation to an object with aliases, define, ignorelt, math,
 * osis, commands, dropdowns and palette.
 *
 * @parameter translation {object} `returnObject` from `fetchTranslations`.
 * returns {object}
 */
function buildTranslation (fetchedTranslation) {
  var translation = {};

  translation.commands = translate(COMMAND_SPECS, fetchedTranslation.blocks);
  COMMAND_SPECS.forEach((spec) => {
    var langSpec;
    if (spec === 'end') {
      langSpec = getEndBlock(fetchedTranslation.lang);
    } else {
      langSpec = fetchedTranslation.blocks[spec] ||
                  // TODO: describe why
                  fetchedTranslation.blocks[spec.replace('%m.location', '%m.spriteOrMouse')];
    }
    if (langSpec) {
      translation.commands[spec] = langSpec;
    } else if (UNTRANSLATED.indexOf(spec) === -1 &&
               ACCEPTABLE_MISSING.indexOf(spec) === -1) {
      console.log(`${translation.lang}: missing translation for "${spec}"`);
    }
  });

  translation.dropdowns = translate(DROPDOWN_SPECS, translation.blocks, translation.editor);

  translation.palette = translate(PALETTE_SPECS, translation.blocks, translation.editor);

  delete translation.blocks;
  delete translation.editor;

  return translation;
}

function specNotInCommandSpec (translation) {
  var specs = Object.keys(translation.blocks);
  specs.forEach(spec => {
    if (COMMAND_SPECS.indexOf(spec) === -1) {
      console.log(`${spec} missing`)
    }
  })
}

// var promises = ALL_LANGS.map(lang => {
//   if (BLACKLIST.indexOf(lang) !== -1) {
//     return;
//   }
//   return fetchTranslations(lang);
// });

fetchTranslations('uk')
  .then(specNotInCommandSpec)
  // .then(r => console.log(r))
  .catch(e => console.error(e))
