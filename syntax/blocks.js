// List of classes we're allowed to override.

const overrideCategories = [
  'motion',
  'looks',
  'sound',
  'pen',
  'variables',
  'list',
  'events',
  'control',
  'sensing',
  'operators',
  'custom',
  'custom-arg',
  'extension',
  'grey',
  'obsolete',
  'music',
  'video',
  'tts',
  'translate',
  'wedo',
  'ev3',
  'microbit',
  'makeymakey',
];
const overrideShapes = ['hat', 'cap', 'stack', 'boolean', 'reporter', 'ring'];

// languages that should be displayed right to left
const rtlLanguages = ['ar', 'ckb', 'fa', 'he'];

// List of commands taken from Scratch
const scratchCommands = require('./commands.js');

const inputNumberPat = /%([0-9]+)/;
const inputPat = /(%[a-zA-Z0-9](?:\.[a-zA-Z0-9]+)?)/;
const inputPatGlobal = new RegExp(inputPat.source, 'g');
const iconPat = /(@[a-zA-Z]+)/;
const splitPat = new RegExp([inputPat.source, '|', iconPat.source, '| +'].join(''), 'g');

const hexColorPat = /^#(?:[0-9a-fA-F]{3}){1,2}?$/;

function parseInputNumber(part) {
  const m = inputNumberPat.exec(part);
  return m ? +m[1] : 0;
}

// used for procDefs
function parseSpec(spec) {
  const parts = spec.split(splitPat).filter(x => !!x);
  const inputs = parts.filter(function(p) {
    return inputPat.test(p);
  });
  return {
    spec: spec,
    parts: parts,
    inputs: inputs,
    hash: hashSpec(spec),
  };
}

function hashSpec(spec) {
  return minifyHash(spec.replace(inputPatGlobal, ' _ '));
}

function minifyHash(hash) {
  return hash
    .replace(/_/g, ' _ ')
    .replace(/ +/g, ' ')
    .replace(/[,%?:]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace('. . .', '...')
    .replace(/^…$/, '...')
    .trim()
    .toLowerCase();
}

const blocksById = {};
const blocksBySpec = {};
const allBlocks = scratchCommands.map(function(def) {
  const spec = def.spec;
  if (!def.id) {
    if (!def.selector) throw new Error('Missing ID: ' + def.spec);
    def.id = 'sb2:' + def.selector;
  }
  if (!def.spec) throw new Error('Missing spec: ' + def.id);

  const info = {
    id: def.id, // Used for Scratch 3 translations
    spec: def.spec, // Used for Scratch 2 translations
    parts: def.spec.split(splitPat).filter(x => !!x),
    selector: def.selector || 'sb3:' + def.id, // Used for JSON marshalling
    inputs: def.inputs,
    shape: def.shape,
    category: def.category,
    hasLoopArrow: !!def.hasLoopArrow,
  };
  if (blocksById[info.id]) {
    throw new Error('Duplicate ID: ' + info.id);
  }
  blocksById[info.id] = info;
  return (blocksBySpec[spec] = info);
});

const unicodeIcons = {
  '@greenFlag': '⚑',
  '@turnRight': '↻',
  '@turnLeft': '↺',
  '@addInput': '▸',
  '@delInput': '◂',
};

const allLanguages = {};
function loadLanguage(code, language) {
  const blocksByHash = (language.blocksByHash = {});

  Object.keys(language.commands).forEach(function(spec) {
    const nativeSpec = language.commands[spec];
    const block = blocksBySpec[spec];

    const nativeHash = hashSpec(nativeSpec);
    blocksByHash[nativeHash] = block;

    // fallback image replacement, for languages without aliases
    const m = iconPat.exec(spec);
    if (m) {
      const image = m[0];
      const hash = nativeHash.replace(hashSpec(image), unicodeIcons[image]);
      blocksByHash[hash] = block;
    }
  });

  language.nativeAliases = {};
  Object.keys(language.aliases).forEach(function(alias) {
    const spec = language.aliases[alias];
    const block = blocksBySpec[spec];
    if (block === undefined) {
      throw new Error("Invalid alias '" + spec + "'");
    }
    const aliasHash = hashSpec(alias);
    blocksByHash[aliasHash] = block;

    language.nativeAliases[spec] = alias;
  });

  // Some English blocks were renamed between Scratch 2 and Scratch 3. Wire them
  // into language.blocksByHash
  Object.keys(language.renamedBlocks || {}).forEach(function(alt) {
    const id = language.renamedBlocks[alt];
    if (!blocksById[id]) throw new Error('Unknown ID: ' + id);
    const block = blocksById[id];
    const hash = hashSpec(alt);
    english.blocksByHash[hash] = block;
  });

  language.nativeDropdowns = {};
  Object.keys(language.dropdowns).forEach(function(name) {
    const nativeName = language.dropdowns[name];
    language.nativeDropdowns[nativeName] = name;
  });

  language.code = code;
  allLanguages[code] = language;
}
function loadLanguages(languages) {
  Object.keys(languages).forEach(function(code) {
    loadLanguage(code, languages[code]);
  });
}

const english = {
  aliases: {
    'turn left %1 degrees': 'turn @turnLeft %1 degrees',
    'turn ccw %1 degrees': 'turn @turnLeft %1 degrees',
    'turn right %1 degrees': 'turn @turnRight %1 degrees',
    'turn cw %1 degrees': 'turn @turnRight %1 degrees',
    'when gf clicked': 'when @greenFlag clicked',
    'when flag clicked': 'when @greenFlag clicked',
    'when green flag clicked': 'when @greenFlag clicked',
  },

  renamedBlocks: {
    'say %1 for %2 secs': 'LOOKS_SAYFORSECS',
    'think %1 for %2 secs': 'LOOKS_THINKFORSECS',
    'play sound %1': 'SOUND_PLAY',
    'wait %1 secs': 'CONTROL_WAIT',
    clear: 'pen.clear',
  },

  define: ['define'],

  // For ignoring the lt sign in the "when distance < _" block
  ignorelt: ['when distance'],

  // Valid arguments to "of" dropdown, for resolving ambiguous situations
  math: ['abs', 'floor', 'ceiling', 'sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'e ^', '10 ^'],

  // Valid arguments to "sound effect" dropdown, for resolving ambiguous situations
  soundEffects: ['pitch', 'pan left/right'],

  // For detecting the "stop" cap / stack block
  osis: ['other scripts in sprite', 'other scripts in stage'],

  dropdowns: {},

  commands: {},
};
allBlocks.forEach(function(info) {
  english.commands[info.spec] = info.spec;
});
loadLanguages({
  en: english,
});

/*****************************************************************************/

function specialCase(id, func) {
  if (!blocksById[id]) throw new Error('Unknown ID: ' + id);
  blocksById[id].specialCase = func;
}

function disambig(id1, id2, test) {
  const func = function(info, children, lang) {
    return blocksById[test(children, lang) ? id1 : id2];
  };
  specialCase(id1, func);
  specialCase(id2, func);
}

disambig('OPERATORS_MATHOP', 'SENSING_OF', function(children, lang) {
  // Operators if math function, otherwise sensing "attribute of" block
  const first = children[0];
  if (!first.isInput) return;
  const name = first.value;
  return lang.math.indexOf(name) > -1;
});

disambig('SOUND_CHANGEEFFECTBY', 'LOOKS_CHANGEEFFECTBY', function(children, lang) {
  // Sound if sound effect, otherwise default to graphic effect
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.shape === 'dropdown') {
      const name = child.value;
      for (const effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true;
        }
      }
    }
  }
  return false;
});

disambig('SOUND_SETEFFECTO', 'LOOKS_SETEFFECTTO', function(children, lang) {
  // Sound if sound effect, otherwise default to graphic effect
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.shape === 'dropdown') {
      const name = child.value;
      for (const effect of lang.soundEffects) {
        if (minifyHash(effect) === minifyHash(name)) {
          return true;
        }
      }
    }
  }
  return false;
});

disambig('DATA_LENGTHOFLIST', 'OPERATORS_LENGTH', function(children) {
  // List block if dropdown, otherwise operators
  const last = children[children.length - 1];
  if (!last.isInput) return;
  return last.shape === 'dropdown';
});

disambig('DATA_LISTCONTAINSITEM', 'OPERATORS_CONTAINS', function(children) {
  // List block if dropdown, otherwise operators
  const first = children[0];
  if (!first.isInput) return;
  return first.shape === 'dropdown';
});

disambig('pen.setColor', 'pen.setHue', function(children) {
  // Color block if color input, otherwise numeric
  const last = children[children.length - 1];
  // If variable, assume color input, since the RGBA hack is common.
  // TODO fix Scratch :P
  return (last.isInput && last.isColor) || last.isBlock;
});

specialCase('CONTROL_STOP', function(info, children, lang) {
  // Cap block unless argument is "other scripts in sprite"
  const last = children[children.length - 1];
  if (!last.isInput) return;
  const value = last.value;
  if (lang.osis.indexOf(value) > -1) {
    return Object.assign({}, blocksById['CONTROL_STOP'], {
      shape: 'stack',
    });
  }
});

function lookupHash(hash, info, children, languages) {
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    if (Object.prototype.hasOwnProperty.call(lang.blocksByHash, hash)) {
      let block = lang.blocksByHash[hash];
      if (info.shape === 'reporter' && block.shape !== 'reporter') continue;
      if (info.shape === 'boolean' && block.shape !== 'boolean') continue;
      if (block.specialCase) {
        block = block.specialCase(info, children, lang) || block;
      }
      return { type: block, lang: lang };
    }
  }
}

function lookupDropdown(name, languages) {
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    if (Object.prototype.hasOwnProperty.call(lang.nativeDropdowns, name)) {
      const nativeName = lang.nativeDropdowns[name];
      return nativeName;
    }
  }
}

function applyOverrides(info, overrides) {
  for (let i = 0; i < overrides.length; i++) {
    const name = overrides[i];
    if (hexColorPat.test(name)) {
      info.color = name;
      info.category = '';
      info.categoryIsDefault = false;
    } else if (overrideCategories.indexOf(name) > -1) {
      info.category = name;
      info.categoryIsDefault = false;
    } else if (overrideShapes.indexOf(name) > -1) {
      info.shape = name;
    } else if (name === 'loop') {
      info.hasLoopArrow = true;
    } else if (name === '+' || name === '-') {
      info.diff = name;
    }
  }
}

function blockName(block) {
  const words = [];
  for (let i = 0; i < block.children.length; i++) {
    const child = block.children[i];
    if (!child.isLabel) return;
    words.push(child.value);
  }
  return words.join(' ');
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
};
