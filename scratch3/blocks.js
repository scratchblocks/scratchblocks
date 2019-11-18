const { Label, Icon, Input, Block, Comment, Glow, Script, Document } = require('../syntax');

const SVG = require('./draw.js');

const { defaultFont, commentFont, makeStyle, makeIcons } = require('./style.js');

/* Label */

const LabelView = function(label) {
  Object.assign(this, label);

  this.el = null;
  this.height = 12;
  this.metrics = null;
  this.x = 0;
};
LabelView.prototype.isLabel = true;

LabelView.prototype.draw = function() {
  return this.el;
};

Object.defineProperty(LabelView.prototype, 'width', {
  get: function() {
    return this.metrics.width;
  },
});

LabelView.metricsCache = {};
LabelView.toMeasure = [];

LabelView.prototype.measure = function() {
  const value = this.value;
  const cls = 'sb3-' + this.cls;
  this.el = SVG.text(0, 13, value, {
    class: 'sb3-label ' + cls,
  });

  let cache = LabelView.metricsCache[cls];
  if (!cache) {
    cache = LabelView.metricsCache[cls] = Object.create(null);
  }

  if (Object.hasOwnProperty.call(cache, value)) {
    this.metrics = cache[value];
  } else {
    const font = /comment-label/.test(this.cls) ? commentFont : defaultFont;
    this.metrics = cache[value] = LabelView.measure(value, font);
    // TODO: word-spacing? (fortunately it seems to have no effect!)
  }
};

LabelView.measure = function(value, font) {
  const context = LabelView.measuring;
  context.font = font;
  const textMetrics = context.measureText(value);
  const width = (textMetrics.width + 0.5) | 0;
  return { width: width };
};

/* Icon */

const IconView = function(icon) {
  Object.assign(this, icon);

  const info = IconView.icons[this.name];
  if (!info) {
    throw new Error('no info for icon: ' + this.name);
  }
  Object.assign(this, info);
};
IconView.prototype.isIcon = true;

IconView.prototype.draw = function() {
  return SVG.symbol('#sb3-' + this.name, {
    width: this.width,
    height: this.height,
  });
};

IconView.icons = {
  greenFlag: { width: 20, height: 21, dy: -2 },
  turnLeft: { width: 24, height: 24 },
  turnRight: { width: 24, height: 24 },
  loopArrow: { width: 24, height: 24 },
  addInput: { width: 4, height: 8 },
  delInput: { width: 4, height: 8 },
  musicBlock: { width: 40, height: 40 },
  penBlock: { width: 40, height: 40 },
  videoBlock: { width: 40, height: 40, dy: 10 },
  ttsBlock: { width: 40, height: 40 },
  translateBlock: { width: 40, height: 40 },
  wedoBlock: { width: 40, height: 40 },
  ev3Block: { width: 40, height: 40 },
  microbitBlock: { width: 40, height: 40 },
  makeymakeyBlock: { width: 40, height: 40 },
};

/* Line */

const LineView = function() {
  this.width = 1;
  this.height = 40;
  this.x = 0;
};
LineView.prototype.isLine = true;

LineView.prototype.measure = function() {};

LineView.prototype.draw = function(parent) {
  const category = parent.info.category;
  return SVG.el('line', {
    class: 'sb3-' + category + '-line',
    'stroke-linecap': 'round',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 40,
  });
};

/* Input */

const InputView = function(input) {
  Object.assign(this, input);
  if (input.label) {
    this.label = newView(input.label);
  }
  this.isBoolean = this.shape === 'boolean';
  this.isDropdown = this.shape === 'dropdown';
  this.isRound = !(this.isBoolean || this.isDropdown);

  this.x = 0;
};
InputView.prototype.isInput = true;

InputView.prototype.measure = function() {
  if (this.hasLabel) this.label.measure();
};

InputView.shapes = {
  string: SVG.pillRect,
  number: SVG.pillRect,
  'number-dropdown': SVG.pillRect,
  color: SVG.pillRect,
  dropdown: SVG.roundRect,

  boolean: SVG.pointedRect,
  stack: SVG.stackRect,
  reporter: SVG.pillRect,
};

InputView.prototype.draw = function(parent) {
  let label, w;
  if (this.isBoolean) {
    w = 48;
  } else if (this.isColor) {
    w = 40;
  } else if (this.hasLabel) {
    label = this.label.draw();
    // Minimum padding of 11
    // Minimum width of 40, at which point we center the label
    const px = this.label.width >= 18 ? 11 : (40 - this.label.width) / 2;
    w = this.label.width + 2 * px;
    label = SVG.move(px, 9, label);
  } else {
    w = this.isInset ? 30 : null;
  }
  if (this.hasArrow) w += 20;
  this.width = w;

  const h = (this.height = 32);

  const el = InputView.shapes[this.shape](w, h);
  SVG.setProps(el, {
    class: [this.isColor ? '' : 'sb3-' + parent.info.category, 'sb3-input', 'sb3-input-' + this.shape].join(' '),
  });

  if (this.isColor) {
    SVG.setProps(el, {
      fill: this.value,
    });
  } else if (this.shape === 'dropdown') {
    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: parent.info.color,
        stroke: 'rgba(0, 0, 0, 0.2)',
      });
    }
  } else if (this.shape === 'number-dropdown') {
    el.classList.add('sb3-' + parent.info.category + '-alt');

    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: 'rgba(0, 0, 0, 0.1)',
        stroke: 'rgba(0, 0, 0, 0.15)', // combines with fill...
      });
    }
  } else if (this.shape === 'boolean') {
    el.classList.remove('sb3-' + parent.info.category);
    el.classList.add('sb3-' + parent.info.category + '-dark');

    // custom colors
    if (parent.info.color) {
      SVG.setProps(el, {
        fill: 'rgba(0, 0, 0, 0.15)',
      });
    }
  }

  const result = SVG.group([el]);
  if (this.hasLabel) {
    result.appendChild(label);
  }
  if (this.hasArrow) {
    result.appendChild(SVG.move(w - 24, 13, SVG.symbol('#sb3-dropdownArrow', {})));
  }
  return result;
};

/* Block */

const BlockView = function(block) {
  Object.assign(this, block);
  this.children = block.children.map(newView);
  this.comment = this.comment ? newView(this.comment) : null;
  this.isRound = this.isReporter;

  // Avoid accidental mutation
  this.info = Object.assign({}, block.info);
  switch (this.info.category) {
    case 'music':
      this.children.unshift(new LineView());
      this.children.unshift(new IconView({ name: 'musicBlock' }));
      this.info.category = 'extension';
      break;
    case 'pen':
      this.children.unshift(new LineView());
      this.children.unshift(new IconView({ name: 'penBlock' }));
      this.info.category = 'extension';
      break;
    case 'video':
      this.children.unshift(new LineView());
      this.children.unshift(new IconView({ name: 'videoBlock' }));
      this.info.category = 'extension';
      break;
    case 'tts':
    case 'translate':
    case 'wedo':
    case 'ev3':
    case 'microbit':
    case 'makeymakey':
      this.children.unshift(new LineView());
      this.children.unshift(new IconView({ name: this.info.category + 'Block' }));
      this.info.category = 'extension';
      break;
  }

  this.x = 0;
  this.width = null;
  this.height = null;
  this.firstLine = null;
  this.innerWidth = null;
};
BlockView.prototype.isBlock = true;

BlockView.prototype.measure = function() {
  for (let i = 0; i < this.children.length; i++) {
    const child = this.children[i];
    if (child.measure) child.measure();
  }
  if (this.comment) this.comment.measure();
};

BlockView.shapes = {
  stack: SVG.stackRect,
  'c-block': SVG.stackRect,
  'if-block': SVG.stackRect,
  celse: SVG.stackRect,
  cend: SVG.stackRect,

  cap: SVG.capRect,
  reporter: SVG.pillRect,
  boolean: SVG.pointedRect,
  hat: SVG.hatRect,
  'define-hat': SVG.procHatRect,
  ring: SVG.pillRect,
};

BlockView.prototype.drawSelf = function(w, h, lines) {
  // mouths
  if (lines.length > 1) {
    return SVG.mouthRect(w, h, this.isFinal, lines, {
      class: ['sb3-' + this.info.category].join(' '),
    });
  }

  // outlines
  if (this.info.shape === 'outline') {
    return SVG.setProps(SVG.stackRect(w, h), {
      class: ['sb3-' + this.info.category, 'sb3-' + this.info.category + '-alt'].join(' '),
    });
  }

  // rings
  if (this.isRing) {
    const child = this.children[0];
    if (child && (child.isInput || child.isBlock || child.isScript)) {
      return SVG.roundRect(w, h, {
        class: ['sb3-' + this.info.category].join(' '),
      });
    }
  }

  const func = BlockView.shapes[this.info.shape];
  if (!func) {
    throw new Error('no shape func: ' + this.info.shape);
  }
  return func(w, h, {
    class: ['sb3-' + this.info.category].join(' '),
  });
};

BlockView.padding = {
  hat: [24, 8],
  'define-hat': [20, 16],
  null: [4, 4],
};

BlockView.prototype.horizontalPadding = function(child) {
  if (this.isRound) {
    if (child.isIcon) {
      return 16;
    } else if (child.isLabel) {
      return 12; // text in circle: 3 units
    } else if (child.isDropdown) {
      return 12; // square in circle: 3 units
    } else if (child.isBoolean) {
      return 12; // hexagon in circle: 3 units
    } else if (child.isRound) {
      return 4; // circle in circle: 1 unit
    }
  } else if (this.isBoolean) {
    if (child.isIcon) {
      return 24; // icon in hexagon: ???
    } else if (child.isLabel) {
      return 20; // text in hexagon: 5 units
    } else if (child.isDropdown) {
      return 20; // square in hexagon: 5 units
    } else if (child.isRound && child.isBlock) {
      return 24; // circle in hexagon: 5 + 1 units
    } else if (child.isRound) {
      return 20; // circle in hexagon: 5 units
    } else if (child.isBoolean) {
      return 8; // hexagon in hexagon: 2 units
    }
  }
  return 8; // default: 2 units
};

BlockView.prototype.marginBetween = function(a, b) {
  // Consecutive labels should be rendered as a single text element.
  // For now, approximate the size of one space
  if (a.isLabel && b.isLabel) {
    return 5;
  }

  return 8; // default: 2 units
};

BlockView.prototype.draw = function() {
  const isDefine = this.info.shape === 'define-hat';
  let children = this.children;
  const isCommand = this.isCommand;

  const padding = BlockView.padding[this.info.shape] || BlockView.padding[null];
  const pt = padding[0],
    pb = padding[1];

  let y = 0;
  const Line = function(y) {
    this.y = y;
    this.width = 0;
    this.height = isCommand ? 40 : 32;
    this.children = [];
  };

  let innerWidth = 0;
  let scriptWidth = 0;
  let line = new Line(y);
  function pushLine() {
    if (lines.length === 0) {
      line.height += pt + pb;
    } else {
      line.height -= 11;
      line.y -= 2;
    }
    y += line.height;
    lines.push(line);
  }

  if (this.info.isRTL) {
    let start = 0;
    let i;
    const flip = function() {
      children = children
        .slice(0, start)
        .concat(children.slice(start, i).reverse())
        .concat(children.slice(i));
    }.bind(this);
    for (i = 0; i < children.length; i++) {
      if (children[i].isScript) {
        flip();
        start = i + 1;
      }
    }
    if (start < i) {
      flip();
    }
  }

  const lines = [];
  let previousChild;
  let lastChild;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.el = child.draw(this);

    if (child.isScript && this.isCommand) {
      this.hasScript = true;
      pushLine();
      child.y = y - 1;
      lines.push(child);
      scriptWidth = Math.max(scriptWidth, Math.max(1, child.width));
      child.height = Math.max(29, child.height + 3) - 2;
      y += child.height;
      line = new Line(y);
      previousChild = null;
    } else if (child.isArrow) {
      line.children.push(child);
      previousChild = child;
    } else {
      // Remember the last child on the first line
      if (!lines.length) {
        lastChild = child;
      }

      // Leave space between inputs
      if (previousChild) {
        line.width += this.marginBetween(previousChild, child);
      }

      // Align first input with right of notch
      const cmw = 48 - this.horizontalPadding(children[0]);
      if ((this.isCommand || this.isOutline) && !child.isLabel && !child.isIcon && line.width < cmw) {
        line.width = cmw;
      }

      // Align extension category icons below notch
      if (child.isIcon && i === 0 && this.isCommand) {
        line.height = Math.max(line.height, child.height + 8);
      }

      child.x = line.width;
      line.width += child.width;
      innerWidth = Math.max(innerWidth, line.width);
      if (!child.isLabel) {
        line.height = Math.max(line.height, child.height);
      }
      line.children.push(child);
      previousChild = child;
    }
  }
  pushLine();

  const padLeft = children.length ? this.horizontalPadding(children[0]) : 0;
  const padRight = children.length ? this.horizontalPadding(lastChild) : 0;
  innerWidth += padLeft + padRight;

  // Commands have a minimum width
  // The hat min-width is arbitrary (not sure of Scratch 3 value)
  // Outline min-width is deliberately higher (because Scratch 3 looks silly)
  innerWidth = Math.max(
    this.hasScript ? 160 : this.isHat ? 108 : this.isCommand || this.isOutline ? 64 : this.isReporter ? 48 : 0,
    innerWidth
  );
  this.height = y;

  this.width = scriptWidth ? Math.max(innerWidth, 15 + scriptWidth) : innerWidth;
  this.firstLine = lines[0];
  this.innerWidth = innerWidth;

  const objects = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.isScript) {
      objects.push(SVG.move(16, line.y, line.el));
      continue;
    }

    const h = line.height;

    for (let j = 0; j < line.children.length; j++) {
      const child = line.children[j];
      if (child.isArrow) {
        objects.push(SVG.move(innerWidth - 32, this.height - 28, child.el));
        continue;
      }

      let y = pt + (h - child.height - pt - pb) / 2;
      if (child.isLabel && i === 0) {
        // We only do this for the first line so that the `else` label is
        // correctly aligned
        y -= 1;
      } else if (isDefine && child.isLabel) {
        y += 3;
      } else if (child.isIcon) {
        y += child.dy | 0;
        if (this.isCommand && i === 0 && j === 0) {
          y += 4;
        }
      }

      let x = padLeft + child.x;
      if (child.dx) {
        x += child.dx;
      }

      objects.push(SVG.move(x, (line.y + y) | 0, child.el));
    }
  }

  const el = this.drawSelf(innerWidth, this.height, lines);
  objects.splice(0, 0, el);
  if (this.info.color) {
    SVG.setProps(el, {
      fill: this.info.color,
      stroke: 'rgba(0, 0, 0, 0.2)',
    });
  }

  return SVG.group(objects);
};

/* Comment */

const CommentView = function(comment) {
  Object.assign(this, comment);
  this.label = newView(comment.label);

  this.width = null;
};
CommentView.prototype.isComment = true;

CommentView.lineLength = 12;
CommentView.prototype.height = 20;

CommentView.prototype.measure = function() {
  this.label.measure();
};

CommentView.prototype.draw = function() {
  const labelEl = this.label.draw();

  this.width = this.label.width + 16;
  return SVG.group([
    SVG.commentLine(this.hasBlock ? CommentView.lineLength : 0, 6),
    SVG.commentRect(this.width, this.height, {
      class: 'sb3-comment',
    }),
    SVG.move(8, 4, labelEl),
  ]);
};

/* Glow */

const GlowView = function(glow) {
  Object.assign(this, glow);
  this.child = newView(glow.child);

  this.width = null;
  this.height = null;
  this.y = 0;
};
GlowView.prototype.isGlow = true;

GlowView.prototype.measure = function() {
  this.child.measure();
};

GlowView.prototype.drawSelf = function() {
  const c = this.child;
  let el;
  const w = this.width;
  const h = this.height - 1;
  if (c.isScript) {
    if (!c.isEmpty && c.blocks[0].isHat) {
      el = SVG.hatRect(w, h);
    } else if (c.isFinal) {
      el = SVG.capRect(w, h);
    } else {
      el = SVG.stackRect(w, h);
    }
  } else {
    el = c.drawSelf(w, h, []);
  }
  return SVG.setProps(el, {
    class: 'sb3-diff sb3-diff-ins',
  });
};
// TODO how can we always raise Glows above their parents?

GlowView.prototype.draw = function() {
  const c = this.child;
  const el = c.isScript ? c.draw(true) : c.draw();

  this.width = c.width;
  this.height = (c.isBlock && c.firstLine.height) || c.height;

  // encircle
  return SVG.group([el, this.drawSelf()]);
};

/* Script */

const ScriptView = function(script) {
  Object.assign(this, script);
  this.blocks = script.blocks.map(newView);

  this.y = 0;
};
ScriptView.prototype.isScript = true;

ScriptView.prototype.measure = function() {
  for (let i = 0; i < this.blocks.length; i++) {
    this.blocks[i].measure();
  }
};

ScriptView.prototype.draw = function(inside) {
  const children = [];
  let y = 1;
  let block;
  this.width = 0;
  for (let i = 0; i < this.blocks.length; i++) {
    block = this.blocks[i];
    const x = inside ? 0 : 2;
    const child = block.draw();
    children.push(SVG.move(x, y, child));
    this.width = Math.max(this.width, block.width);

    const diff = block.diff;
    if (diff === '-') {
      const dw = block.width;
      const dh = block.firstLine.height || block.height;
      children.push(SVG.move(x, y + dh / 2 + 1, SVG.strikethroughLine(dw)));
      this.width = Math.max(this.width, block.width);
    }

    y += block.height;

    const comment = block.comment;
    if (comment) {
      const line = block.firstLine;
      const cx = block.innerWidth + 2 + CommentView.lineLength;
      const cy = y - block.height + line.height / 2;
      const el = comment.draw();
      children.push(SVG.move(cx, cy - comment.height / 2, el));
      this.width = Math.max(this.width, cx + comment.width);
    }
  }
  this.height = y + 1;
  if (!inside && !this.isFinal) {
    this.height += block.hasPuzzle ? 8 : 0;
  }
  if (!inside && block.isGlow) {
    this.height += 2; // TODO unbreak this
  }
  return SVG.group(children);
};

/* Document */

const DocumentView = function(doc) {
  Object.assign(this, doc);
  this.scripts = doc.scripts.map(newView);

  this.width = null;
  this.height = null;
  this.el = null;
  this.defs = null;
};

DocumentView.prototype.measure = function() {
  this.scripts.forEach(function(script) {
    script.measure();
  });
};

DocumentView.prototype.render = function() {
  if (typeof ocbptions === 'function') {
    throw new Error('render() no longer takes a callback');
  }

  // measure strings
  this.measure();

  // TODO: separate layout + render steps.
  // render each script
  let width = 0;
  let height = 0;
  const elements = [];
  for (let i = 0; i < this.scripts.length; i++) {
    const script = this.scripts[i];
    if (height) height += 10;
    script.y = height;
    elements.push(SVG.move(0, height, script.draw()));
    height += script.height + 36;
    width = Math.max(width, script.width + 4);
  }
  this.width = width;
  this.height = height;

  // return SVG
  const svg = SVG.newSVG(width, height);
  svg.appendChild((this.defs = SVG.withChildren(SVG.el('defs'), makeIcons())));

  svg.appendChild(SVG.group(elements));
  this.el = svg;
  return svg;
};

/* Export SVG image as XML string */
DocumentView.prototype.exportSVGString = function() {
  if (this.el == null) {
    throw new Error('call draw() first');
  }

  const style = makeStyle();
  this.defs.appendChild(style);
  const xml = new SVG.XMLSerializer().serializeToString(this.el);
  this.defs.removeChild(style);
  return xml;
};

/* Export SVG image as data URI */
DocumentView.prototype.exportSVG = function() {
  const xml = this.exportSVGString();
  return 'data:image/svg+xml;utf8,' + xml.replace(/[#]/g, encodeURIComponent);
};

DocumentView.prototype.toCanvas = function(cb, scale) {
  scale = scale || 1.0;

  const canvas = SVG.makeCanvas();
  canvas.width = this.width * scale;
  canvas.height = this.height * scale;
  const context = canvas.getContext('2d');

  const image = new Image();
  image.src = this.exportSVG();
  image.onload = function() {
    context.save();
    context.scale(scale, scale);
    context.drawImage(image, 0, 0);
    context.restore();

    cb(canvas);
  };
};

DocumentView.prototype.exportPNG = function(cb, scale) {
  this.toCanvas(function(canvas) {
    if (URL && URL.createObjectURL && Blob && canvas.toBlob) {
      canvas.toBlob(function(blob) {
        cb(URL.createObjectURL(blob));
      }, 'image/png');
    } else {
      cb(canvas.toDataURL('image/png'));
    }
  }, scale);
};

/* view */

const viewFor = node => {
  switch (node.constructor) {
    case Label:
      return LabelView;
    case Icon:
      return IconView;
    case Input:
      return InputView;
    case Block:
      return BlockView;
    case Comment:
      return CommentView;
    case Glow:
      return GlowView;
    case Script:
      return ScriptView;
    case Document:
      return DocumentView;
    default:
      throw new Error('no view for ' + node.constructor.name);
  }
};

const newView = node => new (viewFor(node))(node);

module.exports = {
  newView,
  LabelView,
};
