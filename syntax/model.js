function assert(bool, message) {
  if (!bool) throw 'Assertion failed! ' + (message || '');
}

function indent(text) {
  return text
    .split('\n')
    .map(function(line) {
      return '  ' + line;
    })
    .join('\n');
}

const {
  blocksById,
  parseSpec,
  inputPat,
  parseInputNumber,
  iconPat,
  rtlLanguages,
  unicodeIcons,
  english,
} = require('./blocks.js');

/* Label */

const Label = function(value, cls) {
  this.value = value;
  this.cls = cls || '';
  this.el = null;
  this.height = 12;
  this.metrics = null;
  this.x = 0;
};
Label.prototype.isLabel = true;

Label.prototype.stringify = function() {
  if (this.value === '<' || this.value === '>') return this.value;
  return this.value.replace(/([<>[\](){}])/g, '\\$1');
};

/* Icon */

const Icon = function(name) {
  this.name = name;
  this.isArrow = name === 'loopArrow';

  assert(Icon.icons[name], 'no info for icon ' + name);
};
Icon.prototype.isIcon = true;

Icon.icons = {
  greenFlag: true,
  turnLeft: true,
  turnRight: true,
  loopArrow: true,
  addInput: true,
  delInput: true,
};

Icon.prototype.stringify = function() {
  return unicodeIcons['@' + this.name] || '';
};

/* Input */

const Input = function(shape, value, menu) {
  this.shape = shape;
  this.value = value;
  this.menu = menu || null;

  this.isRound = shape === 'number' || shape === 'number-dropdown';
  this.isBoolean = shape === 'boolean';
  this.isStack = shape === 'stack';
  this.isInset = shape === 'boolean' || shape === 'stack' || shape === 'reporter';
  this.isColor = shape === 'color';
  this.hasArrow = shape === 'dropdown' || shape === 'number-dropdown';
  this.isDarker = shape === 'boolean' || shape === 'stack' || shape === 'dropdown';
  this.isSquare = shape === 'string' || shape === 'color' || shape === 'dropdown';

  this.hasLabel = !(this.isColor || this.isInset);
  this.label = this.hasLabel ? new Label(value, 'literal-' + this.shape) : null;
  this.x = 0;
};
Input.prototype.isInput = true;

Input.prototype.stringify = function() {
  if (this.isColor) {
    assert(this.value[0] === '#');
    return '[' + this.value + ']';
  }
  let text = (this.value ? '' + this.value : '').replace(/ v$/, ' \\v').replace(/([\]\\])/g, '\\$1');
  if (this.hasArrow) text += ' v';
  return this.isRound
    ? '(' + text + ')'
    : this.isSquare
    ? '[' + text + ']'
    : this.isBoolean
    ? '<>'
    : this.isStack
    ? '{}'
    : text;
};

Input.prototype.translate = function() {
  if (this.hasArrow) {
    const value = this.menu || this.value;
    this.value = value; // TODO translate dropdown value
    this.label = new Label(this.value, 'literal-' + this.shape);
  }
};

/* Block */

const Block = function(info, children, comment) {
  assert(info);
  this.info = Object.assign({}, info);
  this.children = children;
  this.comment = comment || null;
  this.diff = null;

  const shape = this.info.shape;
  this.isHat = shape === 'hat' || shape === 'define-hat';
  this.hasPuzzle = shape === 'stack' || shape === 'hat';
  this.isFinal = /cap/.test(shape);
  this.isCommand = shape === 'stack' || shape === 'cap' || /block/.test(shape);
  this.isOutline = shape === 'outline';
  this.isReporter = shape === 'reporter';
  this.isBoolean = shape === 'boolean';

  this.isRing = shape === 'ring';
  this.hasScript = /block/.test(shape);
  this.isElse = shape === 'celse';
  this.isEnd = shape === 'cend';
};
Block.prototype.isBlock = true;

Block.prototype.stringify = function(extras) {
  let firstInput = null;
  let checkAlias = false;
  let text = this.children
    .map(function(child) {
      if (child.isIcon) checkAlias = true;
      if (!firstInput && !(child.isLabel || child.isIcon)) firstInput = child;
      return child.isScript ? '\n' + indent(child.stringify()) + '\n' : child.stringify().trim() + ' ';
    })
    .join('')
    .trim();

  const lang = this.info.language;
  if (checkAlias && lang && this.info.selector) {
    const type = blocksById[this.info.id];
    let alias = lang.nativeAliases[type.spec];
    if (alias) {
      // TODO make translate() not in-place, and use that
      if (inputPat.test(alias) && firstInput) {
        alias = alias.replace(inputPat, firstInput.stringify());
      }
      return alias;
    }
  }

  let overrides = extras || '';
  if (
    this.info.categoryIsDefault === false ||
    (this.info.category === 'custom-arg' && (this.isReporter || this.isBoolean)) ||
    (this.info.category === 'custom' && this.info.shape === 'stack')
  ) {
    if (overrides) overrides += ' ';
    overrides += this.info.category;
  }
  if (overrides) {
    text += ' :: ' + overrides;
  }
  return this.hasScript
    ? text + '\nend'
    : this.info.shape === 'reporter'
    ? '(' + text + ')'
    : this.info.shape === 'boolean'
    ? '<' + text + '>'
    : text;
};

Block.prototype.translate = function(lang, isShallow) {
  if (!lang) throw new Error('Missing language');

  const id = this.info.id;
  if (!id) return;

  if (id === 'PROCEDURES_DEFINITION') {
    assert(this.children[0].isLabel);
    this.children[0] = new Label(lang.define[0] || english.define[0]);
    return;
  }

  const type = blocksById[id];
  const oldSpec = this.info.language.commands[type.spec];

  const nativeSpec = lang.commands[type.spec];
  if (!nativeSpec) return;
  const nativeInfo = parseSpec(nativeSpec);

  const rawArgs = this.children.filter(function(child) {
    return !child.isLabel && !child.isIcon;
  });

  if (!isShallow) {
    rawArgs.forEach(function(child) {
      child.translate(lang);
    });
  }

  // Work out indexes of existing children
  const oldParts = parseSpec(oldSpec).parts;
  const oldInputOrder = oldParts.map(part => parseInputNumber(part)).filter(x => !!x);

  let highestNumber = 0;
  const args = oldInputOrder.map(number => {
    highestNumber = Math.max(highestNumber, number);
    return rawArgs[number - 1];
  });
  const remainingArgs = rawArgs.slice(highestNumber);

  // Get new children by index
  this.children = nativeInfo.parts
    .map(function(part) {
      part = part.trim();
      if (!part) return;
      const number = parseInputNumber(part);
      if (number) {
        return args[number - 1];
      } else {
        return iconPat.test(part) ? new Icon(part.slice(1)) : new Label(part);
      }
    })
    .filter(x => !!x);

  // Push any remaining children, so we pick up C block bodies
  remainingArgs.forEach((arg, index) => {
    if (index === 1 && this.info.id === 'CONTROL_IF') {
      this.children.push(new Label(lang.commands['else']));
    }
    this.children.push(arg);
  });

  this.info.language = lang;
  this.info.isRTL = rtlLanguages.indexOf(lang.code) > -1;
  this.info.categoryIsDefault = true;
};

/* Comment */

const Comment = function(value, hasBlock) {
  this.label = new Label(value, 'comment-label');
  this.width = null;
  this.hasBlock = hasBlock;
};
Comment.prototype.isComment = true;

Comment.prototype.stringify = function() {
  return '// ' + this.label.value;
};

/* Glow */

const Glow = function(child) {
  assert(child);
  this.child = child;
  if (child.isBlock) {
    this.shape = child.info.shape;
    this.info = child.info;
  } else {
    this.shape = 'stack';
  }
};
Glow.prototype.isGlow = true;

Glow.prototype.stringify = function() {
  if (this.child.isBlock) {
    return this.child.stringify('+');
  } else {
    const lines = this.child.stringify().split('\n');
    return lines.map(line => '+ ' + line).join('\n');
  }
};

Glow.prototype.translate = function(lang) {
  this.child.translate(lang);
};

/* Script */

const Script = function(blocks) {
  this.blocks = blocks;
  this.isEmpty = !blocks.length;
  this.isFinal = !this.isEmpty && blocks[blocks.length - 1].isFinal;
};
Script.prototype.isScript = true;

Script.prototype.stringify = function() {
  return this.blocks
    .map(function(block) {
      let line = block.stringify();
      if (block.comment) line += ' ' + block.comment.stringify();
      return line;
    })
    .join('\n');
};

Script.prototype.translate = function(lang) {
  this.blocks.forEach(function(block) {
    block.translate(lang);
  });
};

/* Document */

const Document = function(scripts) {
  this.scripts = scripts;
};

Document.prototype.stringify = function() {
  return this.scripts
    .map(function(script) {
      return script.stringify();
    })
    .join('\n\n');
};

Document.prototype.translate = function(lang) {
  this.scripts.forEach(function(script) {
    script.translate(lang);
  });
};

module.exports = {
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Glow,
  Script,
  Document,
};
