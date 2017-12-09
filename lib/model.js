module.exports = function() {

  function assert(bool, message) { if (!bool) throw "Assertion failed! " + (message || ""); }
  function isArray(o) { return o && o.constructor === Array; }
  function extend(src, dest) { return Object.assign({}, dest, src); }

  function indent(text) {
    return text.split("\n").map(function(line) {
      return "  " + line;
    }).join("\n");
  }

  function maybeNumber(v) {
    v = '' + v;
    var n = parseInt(v);
    if (!isNaN(n)) {
      return n;
    }
    var f = parseFloat(v);
    if (!isNaN(f)) {
      return f;
    }
    return v;
  }


  var SVG = require('./draw.js');

  var {
    defaultFontFamily,
    makeStyle,
    makeIcons,
    darkRect,
    bevelFilter,
    darkFilter,
    desaturateFilter,
  } = require('./style.js');

  var {
    blocksBySelector,
    parseSpec,
    inputPat,
    iconPat,
    rtlLanguages,
    unicodeIcons,
    english,
    blockName,
  } = require('./blocks.js');




  /* Label */

  var Label = function(value, cls) {
    this.value = value;
    this.cls = cls || '';
    this.el = null;
    this.height = 12;
    this.metrics = null;
    this.x = 0;
  };
  Label.prototype.isLabel = true;

  Label.prototype.stringify = function() {
    if (this.value === "<" || this.value === ">") return this.value;
    return (this.value
      .replace(/([<>[\](){}])/g, "\\$1")
    );
  };

  Label.prototype.draw = function() {
    return this.el;
  };

  Object.defineProperty(Label.prototype, 'width', {
    get: function() {
      return this.metrics.width;
    },
  });

  Label.metricsCache = {};
  Label.toMeasure = [];

  Label.prototype.measure = function() {
    var value = this.value;
    var cls = this.cls;
    this.el = SVG.text(0, 10, value, {
      class: 'sb-label ' + cls,
    });

    var cache = Label.metricsCache[cls];
    if (!cache) {
      cache = Label.metricsCache[cls] = Object.create(null);
    }

    if (Object.hasOwnProperty.call(cache, value)) {
      this.metrics = cache[value];
    } else {
      var font = /sb-comment-label/.test(this.cls) ? 'bold 12px Helevetica, Arial, DejaVu Sans, sans-serif'
               : /sb-literal/.test(this.cls) ? 'normal 9px ' + defaultFontFamily
               : 'bold 10px ' + defaultFontFamily;
      this.metrics = cache[value] = Label.measure(value, font);
      // TODO: word-spacing? (fortunately it seems to have no effect!)
    }
  };

  Label.measure = function(value, font) {
    var context = Label.measuring;
    context.font = font;
    var textMetrics = context.measureText(value);
    var width = (textMetrics.width + 0.5) | 0;
    return { width: width };
  };


  /* Icon */

  var Icon = function(name) {
    this.name = name;
    this.isArrow = name === 'loopArrow';

    var info = Icon.icons[name];
    assert(info, "no info for icon " + name);
    Object.assign(this, info);
  };
  Icon.prototype.isIcon = true;

  Icon.prototype.stringify = function() {
    return unicodeIcons["@" + this.name] || "";
  };

  Icon.icons = {
    greenFlag: { width: 20, height: 21, dy: -2 },
    turnLeft: { width: 15, height: 12, dy: +1 },
    turnRight: { width: 15, height: 12, dy: +1 },
    loopArrow: { width: 14, height: 11 },
    addInput: { width: 4, height: 8 },
    delInput: { width: 4, height: 8 },
  };
  Icon.prototype.draw = function() {
    return SVG.symbol('#' + this.name, {
      width: this.width,
      height: this.height,
    });
  };


  /* Input */

  var Input = function(shape, value, menu) {
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
    this.label = this.hasLabel ? new Label(value, ['sb-literal-' + this.shape]) : null;
    this.x = 0;
  };
  Input.prototype.isInput = true;

  Input.fromJSON = function(lang, value, part) {
    var shape = {
      b: 'boolean',
      n: 'number',
      s: 'string',
      d: 'number-dropdown',
      m: 'dropdown',
      c: 'color',
    }[part[1]];

    if (shape === 'color') {
      if (!value && value !== 0) value = parseInt(Math.random() * 256 * 256 * 256);
      value = +value;
      if (value < 0) value = 0xFFFFFFFF + value + 1;
      var hex = value.toString(16);
      hex = hex.slice(Math.max(0, hex.length - 6)); // last 6 characters
      while (hex.length < 6) hex = '0' + hex;
      if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
        hex = hex[0] + hex[2] + hex[4];
      }
      value = '#' + hex;
    } else if (shape === 'dropdown') {
      value = {
        _mouse_: "mouse-pointer",
        _myself_: "myself",
        _stage_: "Stage",
        _edge_: "edge",
        _random_: "random position",
      }[value] || value;
      var menu = value;
      value = lang.dropdowns[value] || value ;
    } else if (shape === 'number-dropdown') {
      value = lang.dropdowns[value] || value ;
    }

    return new Input(shape, ''+value, menu);
  };

  Input.prototype.toJSON = function() {
    if (this.isColor) {
      assert(this.value[0] === '#');
      var h = this.value.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return parseInt(h, 16);
      // TODO signed int?
    }
    if (this.hasArrow) {
      var value = this.menu || this.value;
      if (this.shape === 'dropdown') {
        value = {
          "mouse-pointer": "_mouse_",
          "myself": "_myself",
          "Stage": "_stage_",
          "edge": "_edge_",
          "random position": "_random_",
        }[value] || value;
      }
      if (this.isRound) {
        value = maybeNumber(value);
      }
      return value;
    }
    return this.isBoolean ? false : this.isRound ? maybeNumber(this.value) : this.value;
  };

  Input.prototype.stringify = function() {
    if (this.isColor) {
      assert(this.value[0] === '#');
      return "[" + this.value + "]";
    }
    var text = ((this.value ? "" + this.value : "")
      .replace(/ v$/, " \\v")
      .replace(/([\]\\])/g, "\\$1")
    );
    if (this.hasArrow) text += " v";
    return this.isRound ? "(" + text + ")"
         : this.isSquare ? "[" + text + "]"
         : this.isBoolean ? "<>"
         : this.isStack ? "{}"
         : text;
  };

  Input.prototype.translate = function(lang) {
    if (this.hasArrow) {
      var value = this.menu || this.value;
      this.value = lang.dropdowns[value] || value;
      this.label = new Label(this.value, ['sb-literal-' + this.shape]);
    }
  };

  Input.prototype.measure = function() {
    if (this.hasLabel) this.label.measure();
  };

  Input.shapes = {
    'string': SVG.rect,
    'number': SVG.roundedRect,
    'number-dropdown': SVG.roundedRect,
    'color': SVG.rect,
    'dropdown': SVG.rect,

    'boolean': SVG.pointedRect,
    'stack': SVG.stackRect,
    'reporter': SVG.roundedRect,
  };

  Input.prototype.draw = function(parent) {
    if (this.hasLabel) {
      var label = this.label.draw();
      var w = Math.max(14, this.label.width + (this.shape === 'string' || this.shape === 'number-dropdown' ? 6 : 9));
    } else {
      var w = this.isInset ? 30 : this.isColor ? 13 : null;
    }
    if (this.hasArrow) w += 10;
    this.width = w;

    var h = this.height = this.isRound || this.isColor ? 13 : 14;

    var el = Input.shapes[this.shape](w, h);
    if (this.isColor) {
      SVG.setProps(el, {
        fill: this.value,
      });
    } else if (this.isDarker) {
      el = darkRect(w, h, parent.info.category, el);
      if (parent.info.color) {
        SVG.setProps(el, {
          fill: parent.info.color,
        });
      }
    }

    var result = SVG.group([
      SVG.setProps(el, {
        class: ['sb-input', 'sb-input-'+this.shape].join(' '),
      }),
    ]);
    if (this.hasLabel) {
      var x = this.isRound ? 5 : 4;
      result.appendChild(SVG.move(x, 0, label));
    }
    if (this.hasArrow) {
      var y = this.shape === 'dropdown' ? 5 : 4;
      result.appendChild(SVG.move(w - 10, y, SVG.polygon({
        points: [
          7, 0,
          3.5, 4,
          0, 0,
        ],
        fill: '#000',
        opacity: '0.6',
      })));
    }
    return result;
  };


  /* Block */

  var Block = function(info, children, comment) {
    assert(info);
    this.info = info;
    this.children = children;
    this.comment = comment || null;
    this.diff = null;

    var shape = this.info.shape;
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

    this.x = 0;
    this.width = null;
    this.height = null;
    this.firstLine = null;
    this.innerWidth = null;
  };
  Block.prototype.isBlock = true;

  Block.fromJSON = function(lang, array, part) {
    var args = array.slice();
    var selector = args.shift();
    if (selector === 'procDef') {
      var spec = args[0];
      var inputNames = args[1].slice();
      // var defaultValues = args[2];
      // var isAtomic = args[3]; // TODO

      var info = parseSpec(spec);
      var children = info.parts.map(function(part) {
        if (inputPat.test(part)) {
          var label = new Label(inputNames.shift());
          return new Block({
            shape: part[1] === 'b' ? 'boolean' : 'reporter',
            category: 'custom-arg',
          }, [label]);
        } else {
          return new Label(part);
        }
      });
      var outline = new Block({
        shape: 'outline',
      }, children);

      var children = [new Label(lang.define[0]), outline];
      return new Block({
        shape: 'define-hat',
        category: 'custom',
        selector: 'procDef',
        call: spec,
        names: args[1],
        language: lang,
      }, children);

    } else if (selector === 'call') {
      var spec = args.shift();
      var info = extend(parseSpec(spec), {
        category: 'custom',
        shape: 'stack',
        selector: 'call',
        call: spec,
        language: lang,
      });
      var parts = info.parts;

    } else if (selector === 'readVariable' || selector === 'contentsOfList:' || selector === 'getParam') {
      var shape = selector === 'getParam' && args.pop() === 'b' ? 'boolean' : 'reporter';
      var info = {
        selector: selector,
        shape: shape,
        category: {
          'readVariable': 'variables',
          'contentsOfList:': 'list',
          'getParam': 'custom-arg',
        }[selector],
        language: lang,
      }
      return new Block(info, [new Label(args[0])]);

    } else {
      var info = extend(blocksBySelector[selector], {
        language: lang,
      });
      assert(info, "unknown selector: " + selector);
      var spec = lang.commands[info.spec] || spec;
      var parts = spec ? parseSpec(spec).parts : info.parts;
    }
    var children = parts.map(function(part) {
      if (inputPat.test(part)) {
        var arg = args.shift();
        return (isArray(arg) ? Block : Input).fromJSON(lang, arg, part);
      } else if (iconPat.test(part)) {
        return new Icon(part.slice(1));
      } else {
        return new Label(part.trim());
      }
    });
    args.forEach(function(list, index) {
      list = list || [];
      assert(isArray(list));
      children.push(new Script(list.map(Block.fromJSON.bind(null, lang))));
      if (selector === 'doIfElse' && index === 0) {
        children.push(new Label(lang.commands["else"]));
      }
    });
    // TODO loop arrows
    return new Block(info, children);
  };

  Block.prototype.toJSON = function() {
    var selector = this.info.selector;
    var args = [];

    if (selector === 'procDef') {
      var inputNames = this.info.names;
      var spec = this.info.call;
      var info = parseSpec(spec);
      var defaultValues = info.inputs.map(function(input) {
        return input === '%n' ? 1
             : input === '%b' ? false : "";
      });
      var isAtomic = false; // TODO 'define-atomic' ??
      return ['procDef', spec, inputNames, defaultValues, isAtomic];
    }

    if (selector === 'readVariable' || selector === 'contentsOfList:' || selector === 'getParam') {
      args.push(blockName(this));
      if (selector === 'getParam') args.push(this.isBoolean === 'boolean' ? 'b' : 'r');

    } else {
      for (var i=0; i<this.children.length; i++) {
        var child = this.children[i];
        if (child.isInput || child.isBlock || child.isScript) {
          args.push(child.toJSON());
        }
      }

      if (selector === 'call') {
        return ['call', this.info.call].concat(args);
      }
    }
    if (!selector) throw "unknown block: " + this.info.hash;
    return [selector].concat(args);
  };

  Block.prototype.stringify = function() {
    var firstInput = null;
    var checkAlias = false;
    var text = this.children.map(function(child) {
      if (child.isIcon) checkAlias = true;
      if (!firstInput && !(child.isLabel || child.isIcon)) firstInput = child;
      return child.isScript ? "\n" + indent(child.stringify()) + "\n"
                            : child.stringify().trim() + " ";
    }).join("").trim();

    var lang = this.info.language;
    if (checkAlias && lang && this.info.selector) {
      var type = blocksBySelector[this.info.selector];
      var spec = type.spec;
      var alias = lang.nativeAliases[type.spec]
      if (alias) {
        // TODO make translate() not in-place, and use that
        if (inputPat.test(alias) && firstInput) {
          alias = alias.replace(inputPat, firstInput.stringify());
        }
        return alias;
      }
    }

    if ((this.info.shape === 'reporter' && this.info.category === 'list')
     || (this.info.category === 'custom' && this.info.shape === 'stack')) {
      text += " :: " + this.info.category;
    }
    return this.hasScript ? text + "\nend"
         : this.info.shape === 'reporter' ? "(" + text + ")"
         : this.info.shape === 'boolean' ? "<" + text + ">"
         : text;
  };

  Block.prototype.translate = function(lang, isShallow) {
    var selector = this.info.selector;
    if (!selector) return;
    if (selector === 'procDef') {
      assert(this.children[0].isLabel);
      this.children[0] = new Label(lang.define[0] || english.define[0]);
    }
    var block = blocksBySelector[selector];
    if (!block) return;
    var nativeSpec = lang.commands[block.spec];
    if (!nativeSpec) return;
    var nativeInfo = parseSpec(nativeSpec);
    var args = this.children.filter(function(child) {
      return !child.isLabel && !child.isIcon;
    });
    if (!isShallow) args.forEach(function(child) {
      child.translate(lang);
    });
    this.children = nativeInfo.parts.map(function(part) {
      var part = part.trim();
      if (!part) return;
      return inputPat.test(part) ? args.shift()
           : iconPat.test(part) ? new Icon(part.slice(1)) : new Label(part);
    }).filter(x => !!x);
    args.forEach(function(arg) {
      this.children.push(arg);
    }.bind(this));
    this.info.language = lang;
    this.info.isRTL = rtlLanguages.indexOf(lang.code) > -1;
  };

  Block.prototype.measure = function() {
    for (var i=0; i<this.children.length; i++) {
      var child = this.children[i];
      if (child.measure) child.measure();
    }
    if (this.comment) this.comment.measure();
  };

  Block.shapes = {
    'stack': SVG.stackRect,
    'c-block': SVG.stackRect,
    'if-block': SVG.stackRect,
    'celse': SVG.stackRect,
    'cend': SVG.stackRect,

    'cap': SVG.capRect,
    'reporter': SVG.roundedRect,
    'boolean': SVG.pointedRect,
    'hat': SVG.hatRect,
    'define-hat': SVG.procHatRect,
    'ring': SVG.roundedRect,
  };

  Block.prototype.drawSelf = function(w, h, lines) {
    // mouths
    if (lines.length > 1) {
      return SVG.mouthRect(w, h, this.isFinal, lines, {
        class: ['sb-' + this.info.category, 'sb-bevel'].join(' '),
      });
    }

    // outlines
    if (this.info.shape === 'outline') {
      return SVG.setProps(SVG.stackRect(w, h), {
        class: 'sb-outline',
      });
    }

    // rings
    if (this.isRing) {
      var child = this.children[0];
      if (child && (child.isInput || child.isBlock || child.isScript)) {
        var shape = child.isScript ? 'stack'
                  : child.isInput ? child.shape : child.info.shape;
        return SVG.ringRect(w, h, child.y, child.width, child.height, shape, {
          class: ['sb-' + this.info.category, 'sb-bevel'].join(' '),
        });
      }
    }

    var func = Block.shapes[this.info.shape];
    assert(func, "no shape func: " + this.info.shape);
    return func(w, h, {
      class: ['sb-' + this.info.category, 'sb-bevel'].join(' '),
    });
  };

  Block.prototype.minDistance = function(child) {
    if (this.isBoolean) {
      return (
        child.isReporter ? 4 + child.height/4 | 0 :
        child.isLabel ? 5 + child.height/2 | 0 :
        child.isBoolean || child.shape === 'boolean' ? 5 :
        2 + child.height/2 | 0
      );
    }
    if (this.isReporter) {
      return (
        (child.isInput && child.isRound) || ((child.isReporter || child.isBoolean) && !child.hasScript) ? 0 :
        child.isLabel ? 2 + child.height/2 | 0 :
        -2 + child.height/2 | 0
      );
    }
    return 0;
  };

  Block.padding = {
    'hat':        [15, 6, 2],
    'define-hat': [21, 8, 9],
    'reporter':   [3, 4, 1],
    'boolean':    [3, 4, 2],
    'cap':        [6, 6, 2],
    'c-block':    [3, 6, 2],
    'if-block':   [3, 6, 2],
    'ring':       [4, 4, 2],
    null:         [4, 6, 2],
  };

  Block.prototype.draw = function() {
    var isDefine = this.info.shape === 'define-hat';
    var children = this.children;

    var padding = Block.padding[this.info.shape] || Block.padding[null];
    var pt = padding[0],
        px = padding[1],
        pb = padding[2];

    var y = 0;
    var Line = function(y) {
      this.y = y;
      this.width = 0;
      this.height = y ? 13 : 16;
      this.children = [];
    };

    var innerWidth = 0;
    var scriptWidth = 0;
    var line = new Line(y);
    function pushLine(isLast) {
      if (lines.length === 0) {
        line.height += pt + pb;
      } else {
        line.height += isLast ? 0 : +2;
        line.y -= 1;
      }
      y += line.height;
      lines.push(line);
    }

    if (this.info.isRTL) {
      var start = 0;
      var flip = function() {
        children = (
          children.slice(0, start).concat(
          children.slice(start, i).reverse())
          .concat(children.slice(i))
        );
      }.bind(this);
      for (var i=0; i<children.length; i++) {
        if (children[i].isScript) {
          flip();
          start = i + 1;
        }
      } if (start < i) {
        flip();
      }
    }

    var lines = [];
    for (var i=0; i<children.length; i++) {
      var child = children[i];
      child.el = child.draw(this);

      if (child.isScript && this.isCommand) {
        this.hasScript = true;
        pushLine();
        child.y = y;
        lines.push(child);
        scriptWidth = Math.max(scriptWidth, Math.max(1, child.width));
        child.height = Math.max(12, child.height) + 3;
        y += child.height;
        line = new Line(y);
      } else if (child.isArrow) {
        line.children.push(child);
      } else {
        var cmw = i > 0 ? 30 : 0; // 27
        var md = this.isCommand ? 0 : this.minDistance(child);
        var mw = this.isCommand ? (child.isBlock || child.isInput ? cmw : 0) : md;
        if (mw && !lines.length && line.width < mw - px) {
          line.width = mw - px;
        }
        child.x = line.width;
        line.width += child.width;
        innerWidth = Math.max(innerWidth, line.width + Math.max(0, md - px));
        line.width += 4;
        if (!child.isLabel) {
          line.height = Math.max(line.height, child.height);
        }
        line.children.push(child);
      }
    }
    pushLine(true);

    innerWidth = Math.max(innerWidth + px * 2,
                          this.isHat || this.hasScript ? 83 :
                          this.isCommand || this.isOutline || this.isRing ? 39 : 20);
    this.height = y;
    this.width = scriptWidth ? Math.max(innerWidth, 15 + scriptWidth) : innerWidth;
    if (isDefine) {
      var p = Math.min(26, 3.5 + 0.13 * innerWidth | 0) - 18;
      this.height += p;
      pt += 2 * p;
    }
    this.firstLine = lines[0];
    this.innerWidth = innerWidth;

    var objects = [];

    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      if (line.isScript) {
        objects.push(SVG.move(15, line.y, line.el));
        continue;
      }

      var h = line.height;

      for (var j=0; j<line.children.length; j++) {
        var child = line.children[j];
        if (child.isArrow) {
          objects.push(SVG.move(innerWidth - 15, this.height - 3, child.el));
          continue;
        }

        var y = pt + (h - child.height - pt - pb) / 2 - 1;
        if (isDefine && child.isLabel) {
          y += 3;
        } else if (child.isIcon) {
          y += child.dy | 0;
        }
        if (this.isRing) {
          child.y = line.y + y|0;
          if (child.isInset) {
            continue;
          }
        }
        objects.push(SVG.move(px + child.x, line.y + y|0, child.el));

        if (child.diff === '+') {
          var ellipse = SVG.insEllipse(child.width, child.height);
          objects.push(SVG.move(px + child.x, line.y + y|0, ellipse));
        }
      }
    }

    var el = this.drawSelf(innerWidth, this.height, lines);
    objects.splice(0, 0, el);
    if (this.info.color) {
      setProps(el, {
        fill: this.info.color,
      });
    }

    return SVG.group(objects);
  };


  /* Comment */

  var Comment = function(value, hasBlock) {
    this.label = new Label(value, ['sb-comment-label']);
    this.width = null;
    this.hasBlock = hasBlock;
  };
  Comment.prototype.isComment = true;
  Comment.lineLength = 12;
  Comment.prototype.height = 20;

  Comment.prototype.stringify = function() {
    return "// " + this.label.value;
  };

  Comment.prototype.measure = function() {
    this.label.measure();
  };

  Comment.prototype.draw = function() {
    var labelEl = this.label.draw();

    this.width = this.label.width + 16;
    return SVG.group([
      SVG.commentLine(this.hasBlock ? Comment.lineLength : 0, 6),
      SVG.commentRect(this.width, this.height, {
        class: 'sb-comment',
      }),
      SVG.move(8, 4, labelEl),
    ]);
  };


  /* Script */

  var Script = function(blocks) {
    this.blocks = blocks;
    this.isEmpty = !blocks.length;
    this.isFinal = !this.isEmpty && blocks[blocks.length - 1].isFinal;
    this.y = 0;
  };
  Script.prototype.isScript = true;

  Script.fromJSON = function(lang, blocks) {
    // x = array[0], y = array[1];
    return new Script(blocks.map(Block.fromJSON.bind(null, lang)));
  };

  Script.prototype.toJSON = function() {
    if (this.blocks[0] && this.blocks[0].isComment) return;
    return this.blocks.map(function(block) {
      return block.toJSON();
    });
  };

  Script.prototype.stringify = function() {
    return this.blocks.map(function(block) {
      var line = block.stringify();
      if (block.comment) line += " " + block.comment.stringify();
      return line;
    }).join("\n");
  };

  Script.prototype.translate = function(lang) {
    this.blocks.forEach(function(block) {
      block.translate(lang);
    });
  };

  Script.prototype.measure = function() {
    for (var i=0; i<this.blocks.length; i++) {
      this.blocks[i].measure();
    }
  };

  Script.prototype.draw = function(inside) {
    var children = [];
    var y = 0;
    this.width = 0;
    for (var i=0; i<this.blocks.length; i++) {
      var block = this.blocks[i];
      var x = inside ? 0 : 2;
      var child = block.draw();
      children.push(SVG.move(x, y, child));
      this.width = Math.max(this.width, block.width);

      var diff = block.diff;
      var dw = block.width;
      var dh = block.firstLine.height || block.height;
      if (diff === '-') {
        children.push(SVG.move(x, y + dh / 2, SVG.strikethroughLine(dw)))
        this.width = Math.max(this.width, block.width);
        //child.classList.add('sb-desaturate')
      } else if (diff === '+') { // encircle
        children.push(SVG.move(x, y + 1, SVG.insEllipse(dw, dh - 2)))
        this.width = Math.max(this.width, block.width);
      }

      y += block.height;

      var comment = block.comment;
      if (comment) {
        var line = block.firstLine;
        var cx = block.innerWidth + 2 + Comment.lineLength;
        var cy = y - block.height + (line.height / 2);
        var el = comment.draw();
        children.push(SVG.move(cx, cy - comment.height / 2, el));
        this.width = Math.max(this.width, cx + comment.width);
      }
    }
    this.height = y;
    if (!inside && !this.isFinal) {
      this.height += 3;
    }
    return SVG.group(children);
  };


  /* Document */

  var Document = function(scripts) {
    this.scripts = scripts;

    this.width = null;
    this.height = null;
    this.el = null;
    this.defs = null;
  };

  Document.fromJSON = function(scriptable, lang) {
    var lang = lang || english;
    var scripts = scriptable.scripts.map(function(array) {
      var script = Script.fromJSON(lang, array[2]);
      script.x = array[0];
      script.y = array[1];
      return script;
    });
    // TODO scriptable.scriptComments
    return new Document(scripts);
  };

  Document.prototype.toJSON = function() {
    var jsonScripts = this.scripts.map(function(script) {
      var jsonBlocks = script.toJSON();
      if (!jsonBlocks) return;
      return [10, script.y + 10, jsonBlocks];
    }).filter(x => !!x);
    return {
      scripts: jsonScripts,
      // scriptComments: [], // TODO
    };
  };

  Document.prototype.stringify = function() {
    return this.scripts.map(function(script) {
      return script.stringify();
    }).join("\n\n");
  };

  Document.prototype.translate = function(lang) {
    this.scripts.forEach(function(script) {
      script.translate(lang);
    });
  };

  Document.prototype.measure = function() {
    this.scripts.forEach(function(script) {
      script.measure();
    });
  };

  Document.prototype.render = function(cb) {
    // measure strings
    this.measure();

    // TODO: separate layout + render steps.
    // render each script
    var width = 0;
    var height = 0;
    var elements = [];
    for (var i=0; i<this.scripts.length; i++) {
      var script = this.scripts[i];
      if (height) height += 10;
      script.y = height;
      elements.push(SVG.move(0, height, script.draw()));
      height += script.height;
      width = Math.max(width, script.width + 4);
    }
    this.width = width;
    this.height = height;

    // return SVG
    var svg = SVG.newSVG(width, height);
    svg.appendChild(this.defs = SVG.withChildren(SVG.el('defs'), [
        bevelFilter('bevelFilter', false),
        bevelFilter('inputBevelFilter', true),
        darkFilter('inputDarkFilter'),
        desaturateFilter('desaturateFilter'),
    ].concat(makeIcons())));

    svg.appendChild(SVG.group(elements));
    this.el = svg;

    // nb: async API only for backwards/forwards compatibility reasons.
    // despite appearances, it runs synchronously
    cb(svg);
  };

  /* Export SVG image as XML string */
  Document.prototype.exportSVGString = function() {
    assert(this.el, "call draw() first");

    var style = makeStyle();
    this.defs.appendChild(style);
    var xml = new SVG.XMLSerializer().serializeToString(this.el);
    this.defs.removeChild(style);
    return xml;
  };

  /* Export SVG image as data URI */
  Document.prototype.exportSVG = function() {
    var xml = this.exportSVGString();
    return 'data:image/svg+xml;utf8,' + xml.replace(
      /[#]/g, encodeURIComponent
    );
  }

  Document.prototype.exportPNG = function(cb) {
    var canvas = SVG.makeCanvas();
    canvas.width = this.width;
    canvas.height = this.height;
    var context = canvas.getContext("2d");

    var image = new Image;
    image.src = this.exportSVG();
    image.onload = function() {
      context.drawImage(image, 0, 0);

      if (URL && URL.createObjectURL && Blob && canvas.toBlob) {
        var blob = canvas.toBlob(function(blob) {
          cb(URL.createObjectURL(blob));
        }, 'image/png');
      } else {
        cb(canvas.toDataURL('image/png'));
      }
    };
  }


  return {
    Label,
    Icon,
    Input,
    Block,
    Comment,
    Script,
    Document,
  }

}();
