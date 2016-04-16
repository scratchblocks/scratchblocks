/*
 * scratchblocks
 * http://scratchblocks.github.io/
 *
 * Copyright 2013-2016, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 */
var scratchblocks = function () {
  'use strict';

  /* utils */

  function assert(bool, message) {
    if (!bool) throw "Assertion failed! " + (message || "");
  }

  function isArray(o) {
    return o && o.constructor === Array;
  }

  function bool(x) { return !!x; }

  function extend(src, dest) {
    src = src || {};
    dest = dest || {};
    for (var key in src) {
      if (src.hasOwnProperty(key) && !dest.hasOwnProperty(key)) {
        dest[key] = src[key];
      }
    }
    return dest;
  }

  // deep clone dictionaries/lists.
  function clone(val) {
    if (val == null) return val;
    if (val.constructor == Array) {
      return val.map(clone);
    } else if (typeof val == "object") {
      var result = {}
      for (var key in val) {
        result[clone(key)] = clone(val[key]);
      }
      return result;
    } else {
      return val;
    }
  }

  /*****************************************************************************/

  // List of classes we're allowed to override.

  var overrideCategories = ["motion", "looks", "sound", "pen", "variables", "list", "events", "control", "sensing", "operators", "custom", "custom-arg", "extension", "grey", "obsolete"];
  var overrideShapes = ["hat", "cap", "stack", "embedded", "boolean", "reporter", "celse", "cend", "ring"];

  /*
   * We need to store info such as category and shape for each block.
   *
   * This can be indexed in two ways:
   *
   *  - by the text input to the parser, minus the insert parts
   *
   *      (eg. "say [Hi!] for (3) secs" is minifed to "sayforsecs", which we
   *           then look up in the database
   *
   *  - by a language code & blockid
   *
   *      (eg. "de" & "say _ for _ secs")
   *
   *      This is used by external add-ons for translating between languages,
   *      and won't get used internally.
   *
   * Some definitions:
   *
   *  - spec: The spec for the block, with underscores representing inserts.
   *          May be translated.
   *          eg. "sage _ für _ Sek."
   *
   *  - blockid: the English spec.
   *          eg. "say _ for _ secs"
   *
   */

  // languages that should be displayed right to left
  var rtlLanguages = ['ar', 'fa', 'he'];

  // List of commands taken from Scratch
  var scratchCommands = [ ["move %n steps", " ", 1, "forward:"], ["turn @turnRight %n degrees", " ", 1, "turnRight:"], ["turn @turnLeft %n degrees", " ", 1, "turnLeft:"], ["point in direction %d.direction", " ", 1, "heading:"], ["point towards %m.spriteOrMouse", " ", 1, "pointTowards:"], ["go to x:%n y:%n", " ", 1, "gotoX:y:"], ["go to %m.location", " ", 1, "gotoSpriteOrMouse:"], ["glide %n secs to x:%n y:%n", " ", 1, "glideSecs:toX:y:elapsed:from:"], ["change x by %n", " ", 1, "changeXposBy:"], ["set x to %n", " ", 1, "xpos:"], ["change y by %n", " ", 1, "changeYposBy:"], ["set y to %n", " ", 1, "ypos:"], ["set rotation style %m.rotationStyle", " ", 1, "setRotationStyle"], ["say %s for %n secs", " ", 2, "say:duration:elapsed:from:"], ["say %s", " ", 2, "say:"], ["think %s for %n secs", " ", 2, "think:duration:elapsed:from:"], ["think %s", " ", 2, "think:"], ["show", " ", 2, "show"], ["hide", " ", 2, "hide"], ["switch costume to %m.costume", " ", 2, "lookLike:"], ["next costume", " ", 2, "nextCostume"], ["next backdrop", " ", 102, "nextScene"], ["switch backdrop to %m.backdrop", " ", 2, "startScene"], ["switch backdrop to %m.backdrop and wait", " ", 102, "startSceneAndWait"], ["change %m.effect effect by %n", " ", 2, "changeGraphicEffect:by:"], ["set %m.effect effect to %n", " ", 2, "setGraphicEffect:to:"], ["clear graphic effects", " ", 2, "filterReset"], ["change size by %n", " ", 2, "changeSizeBy:"], ["set size to %n%", " ", 2, "setSizeTo:"], ["go to front", " ", 2, "comeToFront"], ["go back %n layers", " ", 2, "goBackByLayers:"], ["play sound %m.sound", " ", 3, "playSound:"], ["play sound %m.sound until done", " ", 3, "doPlaySoundAndWait"], ["stop all sounds", " ", 3, "stopAllSounds"], ["play drum %d.drum for %n beats", " ", 3, "playDrum"], ["rest for %n beats", " ", 3, "rest:elapsed:from:"], ["play note %d.note for %n beats", " ", 3, "noteOn:duration:elapsed:from:"], ["set instrument to %d.instrument", " ", 3, "instrument:"], ["change volume by %n", " ", 3, "changeVolumeBy:"], ["set volume to %n%", " ", 3, "setVolumeTo:"], ["change tempo by %n", " ", 3, "changeTempoBy:"], ["set tempo to %n bpm", " ", 3, "setTempoTo:"], ["clear", " ", 4, "clearPenTrails"], ["stamp", " ", 4, "stampCostume"], ["pen down", " ", 4, "putPenDown"], ["pen up", " ", 4, "putPenUp"], ["set pen color to %c", " ", 4, "penColor:"], ["change pen color by %n", " ", 4, "changePenHueBy:"], ["set pen color to %n", " ", 4, "setPenHueTo:"], ["change pen shade by %n", " ", 4, "changePenShadeBy:"], ["set pen shade to %n", " ", 4, "setPenShadeTo:"], ["change pen size by %n", " ", 4, "changePenSizeBy:"], ["set pen size to %n", " ", 4, "penSize:"], ["when @greenFlag clicked", "h", 5, "whenGreenFlag"], ["when %m.key key pressed", "h", 5, "whenKeyPressed"], ["when this sprite clicked", "h", 5, "whenClicked"], ["when backdrop switches to %m.backdrop", "h", 5, "whenSceneStarts"], ["when %m.triggerSensor > %n", "h", 5, "whenSensorGreaterThan"], ["when I receive %m.broadcast", "h", 5, "whenIReceive"], ["broadcast %m.broadcast", " ", 5, "broadcast:"], ["broadcast %m.broadcast and wait", " ", 5, "doBroadcastAndWait"], ["wait %n secs", " ", 6, "wait:elapsed:from:"], ["repeat %n", "c", 6, "doRepeat"], ["forever", "cf",6, "doForever"], ["if %b then", "c", 6, "doIf"], ["if %b then", "e", 6, "doIfElse"], ["wait until %b", " ", 6, "doWaitUntil"], ["repeat until %b", "c", 6, "doUntil"], ["stop %m.stop", "f", 6, "stopScripts"], ["when I start as a clone", "h", 6, "whenCloned"], ["create clone of %m.spriteOnly", " ", 6, "createCloneOf"], ["delete this clone", "f", 6, "deleteClone"], ["ask %s and wait", " ", 7, "doAsk"], ["turn video %m.videoState", " ", 7, "setVideoState"], ["set video transparency to %n%", " ", 7, "setVideoTransparency"], ["reset timer", " ", 7, "timerReset"], ["set %m.var to %s", " ", 9, "setVar:to:"], ["change %m.var by %n", " ", 9, "changeVar:by:"], ["show variable %m.var", " ", 9, "showVariable:"], ["hide variable %m.var", " ", 9, "hideVariable:"], ["add %s to %m.list", " ", 12, "append:toList:"], ["delete %d.listDeleteItem of %m.list", " ", 12, "deleteLine:ofList:"], ["if on edge, bounce", " ", 1, "bounceOffEdge"], ["insert %s at %d.listItem of %m.list", " ", 12, "insert:at:ofList:"], ["replace item %d.listItem of %m.list with %s", " ", 12, "setLine:ofList:to:"], ["show list %m.list", " ", 12, "showList:"], ["hide list %m.list", " ", 12, "hideList:"], ["x position", "r", 1, "xpos"], ["y position", "r", 1, "ypos"], ["direction", "r", 1, "heading"], ["costume #", "r", 2, "costumeIndex"], ["size", "r", 2, "scale"], ["backdrop name", "r", 102, "sceneName"], ["backdrop #", "r", 102, "backgroundIndex"], ["volume", "r", 3, "volume"], ["tempo", "r", 3, "tempo"], ["touching %m.touching?", "b", 7, "touching:"], ["touching color %c?", "b", 7, "touchingColor:"], ["color %c is touching %c?", "b", 7, "color:sees:"], ["distance to %m.spriteOrMouse", "r", 7, "distanceTo:"], ["answer", "r", 7, "answer"], ["key %m.key pressed?", "b", 7, "keyPressed:"], ["mouse down?", "b", 7, "mousePressed"], ["mouse x", "r", 7, "mouseX"], ["mouse y", "r", 7, "mouseY"], ["loudness", "r", 7, "soundLevel"], ["video %m.videoMotionType on %m.stageOrThis", "r", 7, "senseVideoMotion"], ["timer", "r", 7, "timer"], ["%m.attribute of %m.spriteOrStage", "r", 7, "getAttribute:of:"], ["current %m.timeAndDate", "r", 7, "timeAndDate"], ["days since 2000", "r", 7, "timestamp"], ["username", "r", 7, "getUserName"], ["%n + %n", "r", 8, "+"], ["%n - %n", "r", 8, "-"], ["%n * %n", "r", 8, "*"], ["%n / %n", "r", 8, "/"], ["pick random %n to %n", "r", 8, "randomFrom:to:"], ["%s < %s", "b", 8, "<"], ["%s = %s", "b", 8, "="], ["%s > %s", "b", 8, ">"], ["%b and %b", "b", 8, "&"], ["%b or %b", "b", 8, "|"], ["not %b", "b", 8, "not"], ["join %s %s", "r", 8, "concatenate:with:"], ["letter %n of %s", "r", 8, "letter:of:"], ["length of %s", "r", 8, "stringLength:"], ["%n mod %n", "r", 8, "%"], ["round %n", "r", 8, "rounded"], ["%m.mathOp of %n", "r", 8, "computeFunction:of:"], ["item %d.listItem of %m.list", "r", 12, "getLine:ofList:"], ["length of %m.list", "r", 12, "lineCountOfList:"], ["%m.list contains %s?", "b", 12, "list:contains:"], ["when %m.booleanSensor", "h", 20, ""], ["when %m.sensor %m.lessMore %n", "h", 20, ""], ["sensor %m.booleanSensor?", "b", 20, ""], ["%m.sensor sensor value", "r", 20, ""], ["turn %m.motor on for %n secs", " ", 20, ""], ["turn %m.motor on", " ", 20, ""], ["turn %m.motor off", " ", 20, ""], ["set %m.motor power to %n", " ", 20, ""], ["set %m.motor2 direction to %m.motorDirection", " ", 20, ""], ["when distance %m.lessMore %n", "h", 20, ""], ["when tilt %m.eNe %n", "h", 20, ""], ["distance", "r", 20, ""], ["tilt", "r", 20, ""], ["turn %m.motor on for %n seconds", " ", 20, ""], ["set light color to %n", " ", 20, ""], ["play note %n for %n seconds", " ", 20, ""], ["when tilted", "h", 20, ""], ["tilt %m.xxx", "r", 20, ""], ["else", "else", 6, ""], ["end", "end", 6, ""], [". . .", " ", 42, ""], ["%n @addInput", "ring", 42, ""], ];

  var categoriesById = {
    1:  "motion",
    2:  "looks",
    3:  "sound",
    4:  "pen",
    5:  "events",
    6:  "control",
    7:  "sensing",
    8:  "operators",
    9:  "variables",
    10: "custom",
    11: "parameter",
    12: "list",
    20: "extension",
    42: "grey",
  };

  var typeShapes = {
    ' ': 'stack',
    'b': 'boolean',
    'c': 'c-block',
    'e': 'if-block',
    'f': 'cap',
    'h': 'hat',
    'r': 'reporter',
    'cf': 'c-block cap',
    'else': 'celse',
    'end': 'cend',
    'ring': 'ring',
  };

  var inputPat = /(%[a-zA-Z](?:\.[a-zA-Z0-9]+)?)/g;
  var iconPat = /(@[a-zA-Z]+)/;
  var splitPat = new RegExp([inputPat.source, '|', iconPat.source].join(''), 'g');

  var hexColorPat = /^#(?:[0-9a-fA-F]{3}){1,2}?$/;

  function parseSpec(spec) {
    var parts = spec.split(splitPat).filter(bool);
    return {
      spec: spec,
      parts: parts,
      inputs: parts.filter(function(p) { return inputPat.test(p); }),
      hash: hashSpec(spec),
    };
  }

  function hashSpec(spec) {
    return minifyHash(spec.replace(inputPat, " _ "));
  }

  function minifyHash(hash) {
    return (hash
        .replace(/_/g, ' _ ')
        .replace(/ +/g, ' ')
        .replace(/[,%?:]/g, '')
        .replace(/ß/g, 'ss')
        .replace(/ä/g,"a")
        .replace(/ö/g,"o")
        .replace(/ü/g,"u")
        .replace('. . .', '...')
    ).trim();
  }

  var blocksBySelector = {};
  var blocksBySpec = {};
  var allBlocks = scratchCommands.map(function(command) {
    var info = extend(parseSpec(command[0]), {
      shape: typeShapes[command[1]], // /[ bcefhr]|cf/
      category: categoriesById[command[2] % 100],
      selector: command[3],
      hasLoopArrow: ['doRepeat', 'doUntil', 'doForever'].indexOf(command[3]) > -1,
    });
    if (info.selector) {
      assert(!blocksBySelector[info.selector], info.selector);
      blocksBySelector[info.selector] = info;
    }
    return blocksBySpec[info.spec] = info;
  });

  var imageIcons = {
    "@greenFlag": "⚑",
    "@turnRight": "↻",
    "@turnLeft": "↺",
  };

  var allLanguages = {};
  function loadLanguage(code, language) {
    var blocksByHash = language.blocksByHash = {};

    Object.keys(language.commands).forEach(function(spec) {
      var nativeSpec = language.commands[spec];
      var block = blocksBySpec[spec];

      var nativeHash = hashSpec(nativeSpec);
      blocksByHash[nativeHash] = block;

      // fallback image replacement, for languages without aliases
      var m = iconPat.exec(spec);
      if (m) {
        var image = m[0];
        var hash = nativeHash.replace(image, imageIcons[image]);
        blocksByHash[hash] = block;
      }
    });

    Object.keys(language.aliases).forEach(function(alias) {
      var spec = language.aliases[alias];
      var block = blocksBySpec[spec];

      var aliasHash = hashSpec(alias);
      blocksByHash[aliasHash] = block;
    });

    allLanguages[code] = language;
  }
  function loadLanguages(languages) {
    Object.keys(languages).forEach(function(code) {
      loadLanguage(code, languages[code]);
    });
  }

  var english = {
    aliases: {
      "turn left %n degrees": "turn @turnLeft %n degrees",
      "turn ccw %n degrees": "turn @turnLeft %n degrees",
      "turn right %n degrees": "turn @turnRight %n degrees",
      "turn cw %n degrees": "turn @turnRight %n degrees",
      "when gf clicked": "when @greenFlag clicked",
      "when flag clicked": "when @greenFlag clicked",
      "when green flag clicked": "when @greenFlag clicked",
      "...": ". . .",
      "…": ". . .",
    },

    define: ["define"],

    // For ignoring the lt sign in the "when distance < _" block
    ignorelt: ["when distance"],

    // Valid arguments to "of" dropdown, for resolving ambiguous situations
    math: ["abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "e ^", "10 ^"],

    // For detecting the "stop" cap / stack block
    osis: ["other scripts in sprite", "other scripts in stage"],

    commands: {},
  };
  allBlocks.forEach(function(info) {
    english.commands[info.spec] = info.spec;
  }),
  loadLanguages({
    en: english,
  });

  /*****************************************************************************/

  function disambig(selector1, selector2, test) {
    var func = function(info, children, lang) {
      return blocksBySelector[test(children, lang) ? selector1 : selector2];
    };
    blocksBySelector[selector1].specialCase = blocksBySelector[selector2].specialCase = func;
  }

  disambig('computeFunction:of:', 'getAttribute:of:', function(children, lang) {
    // Operators if math function, otherwise sensing "attribute of" block
    var first = children[0];
    if (!first.isInput) return;
    var name = first.value;
    return lang.math.indexOf(name) > -1;
  });

  disambig('lineCountOfList:', 'stringLength:', function(children, lang) {
    // List block if dropdown, otherwise operators
    var last = children[children.length - 1];
    if (!last.isInput) return;
    return last.shape === 'dropdown';
  });

  blocksBySelector['stopScripts'].specialCase = function(info, children, lang) {
    // Cap block unless argument is "other scripts in sprite"
    var last = children[children.length - 1];
    if (!last.isInput) return;
    var value = last.value;
    if (lang.osis.indexOf(value) > -1) {
      return extend(blocksBySelector['stopScripts'], {
        shape: 'stack',
      });
    }
  }


  function applyOverrides(info, overrides) {
    for (var i=0; i<overrides.length; i++) {
      var name = overrides[i];
      if (hexColorPat.test(name)) {
        info.color = name;
        info.category = "";
        info.categoryIsDefault = false;
      } else if (overrideCategories.indexOf(name) > -1) {
        info.category = name;
        info.categoryIsDefault = false;
      } else if (overrideShapes.indexOf(name) > -1) {
        info.shape = name;
      } else if (name === 'cstart') {
        info.shape = 'c-block';
      } else if (name === 'loop') {
        info.hasLoopArrow = true;
      }
    }
  }

  function paintBlock(info, children, languages) {
    var overrides = [];
    if (isArray(children[children.length - 1])) {
      overrides = children.pop();
    }

    // build hash
    var words = [];
    for (var i=0; i<children.length; i++) {
      var child = children[i];
      if (child.isLabel) {
        words.push(child.value);
      } else if (child.isIcon) {
        words.push("@" + child.name);
      } else {
        words.push("_");
      }
    }
    var hash = info.hash = minifyHash(words.join(" "));
    console.log(hash);

    // paint
    for (var i=0; i<languages.length; i++) {
      var lang = languages[i];
      if (lang.blocksByHash.hasOwnProperty(hash)) {
        var block = lang.blocksByHash[hash];
        if (block.specialCase) {
          block = block.specialCase(info, children, lang) || block;
        }
        info.language = lang;
        if (block.shape === 'ring' ? info.shape === 'reporter' : info.shape === 'stack') {
          info.shape = block.shape;
        }
        info.category = block.category;
        info.categoryIsDefault = false;
        info.selector = block.selector; // for backpack
        info.hasLoopArrow = block.hasLoopArrow;

        // image replacement
        if (iconPat.test(block.spec) || lang.aliases[hash]) {
          var inputs = children.filter(function(child) {
            return !child.isLabel;
          });
          children = block.parts.map(function(part) {
            part = part.trim();
            if (!part) return;
            return inputPat.test(part) ? inputs.shift()
                 : iconPat.test(part) ? new Icon(part.slice(1)) : new Label(part);
          }).filter(bool);
        }
      }
    }

    applyOverrides(info, overrides);

    // loop arrows
    if (info.hasLoopArrow) {
      children.push(new Icon('loopArrow'));
    }

    return new Block(info, children);
  }


  /* * */

  function parseLines(code, languages) {
    var tok = code[0];
    var index = 0;
    function next() {
      tok = code[++index];
    }
    function peek() {
      return code[index + 1];
    }
    function peekNonWs() {
      for (var i = index + 1; i<code.length; i++) {
        if (code[i] !== ' ') return code[i];
      }
    }

    var define = [];
    languages.map(function(lang) {
      define = define.concat(lang.define);
    });
    // NB. we assume 'define' is a single word in every language
    function isDefine(word) {
      return define.indexOf(word) > -1;
    }

    function makeBlock(shape, children) {
      var info = {
        shape: shape,
        category: shape === 'define-hat' ? 'custom'
                : shape === 'reporter' ? 'variables' : 'obsolete',
        categoryIsDefault: true,
        hasLoopArrow: false,
      };
      return paintBlock(info, children, languages);
    }
    // TODO readVariable selector

    function pParts(end) {
      // TODO ignoreLt
      var children = [];
      var label;
      while (tok && tok !== '\n') {
        if (tok === '<' || (tok === '>' && end === '>')) {
          var last = children[children.length - 1];
          var c = peekNonWs();
          if (last && last.isInput && (c === '[' || c === '(' || c === '<')) {
            label = null;
            children.push(new Label(tok));
            next();
            continue;
          }
        }
        if (tok === end) break;
        if (tok === '/' && peek() === '/') break;

        switch (tok) {
          case '[':
            label = null;
            children.push(pString());
            break;
          case '(':
            label = null;
            children.push(pReporter());
            break;
          case '<':
            label = null;
            children.push(pPredicate());
            break;
          case '{':
            label = null;
            children.push(pEmbedded());
            break;
          case ' ':
            next();
            if (label && isDefine(label.value)) {
              // define hat
              children.push(pOutline());
              return children;
            }
            label = null;
            break;
          case '◂':
          case '▸':
            children.push(pIcon());
            label = null;
            break;
          case ':':
            if (peek() === ':') {
              children.push(pOverrides(end));
              return children;
            } // fall-thru
          case '/':
          default:
            if (!label) children.push(label = new Label(""));
            label.value += tok;
            next();
        }
      }
      return children;
    }

    function pString() {
      next(); // '['
      var s = "";
      var escapeV = false;
      while (tok && tok !== ']' && tok !== '\n') {
        if (tok === '\\') {
          next();
          if (tok === 'v') escapeV = true;
          if (!tok) break;
        } else {
          escapeV = false;
        }
        s += tok;
        next();
      }
      if (tok === ']') next();
      if (hexColorPat.test(s)) {
        return new Input('color', s);
      }
      return !escapeV && / v$/.test(s) ? new Input('dropdown', s.slice(0, s.length - 2))
                                       : new Input('string', s);
    }

    function pBlock(end) {
      var children = pParts(end);
      if (tok && tok === '\n') next();
      if (children.length === 0) return;

      // define hats
      var first = children[0];
      if (first && first.isLabel && isDefine(first.value)) {
        return makeBlock('define-hat', children);
      }

      // standalone reporters
      if (children.length === 1) {
        var child = children[0];
        if (child.isBlock && (child.isReporter || child.isBoolean || child.isRing)) {
          return child;
        }
      }

      return makeBlock('stack', children);
    }

    function pReporter() {
      next(); // '('
      var children = pParts(')');
      if (tok && tok === ')') next();

      // empty numbers
      if (children.length === 0) {
        return new Input('number', "");
      }

      // number
      if (children.length === 1 && children[0].isLabel) {
        var value = children[0].value;
        if (/^[0-9e.-]*$/.test(value)) {
          return new Input('number', value);
        }
      }

      // number-dropdown
      for (var i=0; i<children.length; i++) {
        if (!children[i].isLabel) {
          break;
        }
      } if (i === children.length) {
        var last = children[i - 1];
        if (i > 1 && last.value === 'v') {
          children.pop();
          var value = children.map(function(l) { return l.value; }).join(" ");
          return new Input('number-dropdown', value);
        }
      }

      var block = makeBlock('reporter', children);

      // rings
      if (block.info.shape === 'ring') {
        var first = block.children[0];
        if (first.isInput && first.shape === 'number' && first.value === "") {
          block.children[0] = new Input('reporter');
        } else if (first.isScript && first.isEmpty) {
          block.children[0] = new Input('stack');
        }
      }

      return block;
    }

    function pPredicate() {
      next(); // '<'
      var children = pParts('>');
      if (tok && tok === '>') next();
      if (children.length === 0) {
        return new Input('boolean');
      }
      return makeBlock('boolean', children);
    }

    function pEmbedded() {
      next(); // '{'

      var f = function() {
        while (tok && tok !== '}') {
          var block = pBlock('}');
          if (block) return block;
        }
      };
      var scripts = parseScripts(f);
      var blocks = [];
      scripts.forEach(function(script) {
        blocks = blocks.concat(script.blocks);
      });

      if (tok === '}') next();
      return new Script(blocks);
    }

    function pIcon() {
      var c = tok;
      next();
      switch (c) {
        case '▸':
          return new Icon('addInput');
        case '◂':
          return new Icon('delInput');
      }
    }

    function pOverrides(end) {
      next();
      next();
      var overrides = [];
      var override = "";
      while (tok && tok !== '\n' && tok !== end) {
        if (tok === ' ') {
          if (override) {
            overrides.push(override);
            override = "";
          }
        } else if (tok === '/' && peek() === '/') {
          break;
        } else {
          override += tok;
        }
        next();
      }
      if (override) overrides.push(override);
      return overrides;
    }

    function pComment(end) {
      next();
      next();
      var comment = "";
      while (tok && tok !== '\n' && tok !== end) {
        comment += tok;
        next();
      }
      if (tok && tok === '\n') next();
      return new Comment(comment, true);
    }

    function pOutline() {
      var children = [];
      function parseArg(kind, end) {
        label = null;
        next();
        var parts = pParts(end);
        if (tok === end) next();
        children.push(paintBlock({
          shape: kind === 'boolean' ? 'boolean' : 'reporter',
          argument: kind,
          category: 'custom-arg',
        }, parts, languages));
      }
      var label;
      while (tok && tok !== '\n') {
        switch (tok) {
          case '(': parseArg('number', ')'); break;
          case '[': parseArg('string', ']'); break;
          case '<': parseArg('boolean', '>'); break;
          case ' ': next(); label = null; break;
          case ':':
            if (peek() === ':') {
              children.push(pOverrides());
              break;
            } // fall-thru
          default:
            if (!label) children.push(label = new Label(""));
            label.value += tok;
            next();
        }
      }
      return makeBlock('outline', children);
    }

    function pLine() {
      var block = pBlock();
      if (tok === '/' && peek() === '/') {
        var comment = pComment();
        comment.hasBlock = block && block.children.length;
        if (!comment.hasBlock) {
          return comment;
        }
        block.comment = comment;
      }
      return block;
    }

    return function() {
      if (!tok) return undefined;
      var line = pLine();
      return line || 'NL';
    }
  }

  /* * */

  function parseScripts(getLine) {
    var line = getLine();
    function next() {
      line = getLine();
    }

    function pFile() {
      while (line === 'NL') next();
      var scripts = [];
      while (line) {
        var blocks = [];
        while (line && line !== 'NL') {
          var b = pLine();

          if (b.isElse || b.isEnd) {
            b = new Block(extend(b.info, {
              shape: 'stack',
            }), b.children);
          }

          if (b.isHat) {
            if (blocks.length) scripts.push(new Script(blocks));
            blocks = [b];
          } else if (b.isFinal) {
            blocks.push(b);
            break;
          } else if (b.isCommand) {
            blocks.push(b);
          } else { // reporter or predicate
            if (blocks.length) scripts.push(new Script(blocks));
            scripts.push(new Script([b]));
            blocks = [];
            break;
          }
        }
        if (blocks.length) scripts.push(new Script(blocks));
        while (line === 'NL') next();
      }
      return scripts;
    }

    function pLine() {
      var b = line;
      next();

      if (b.hasScript) {
        while (true) {
          var blocks = pMouth();
          b.children.push(new Script(blocks));
          if (line && line.isElse) {
            for (var i=0; i<line.children.length; i++) {
              b.children.push(line.children[i]);
            }
            next();
            continue;
          }
          if (line && line.isEnd) {
            next();
          }
          break;
        }
      }
      return b;
    }

    function pMouth() {
      var blocks = [];
      while (line) {
        if (line === 'NL') {
          next();
          continue;
        }
        if (!line.isCommand) {
          return blocks;
        }
        blocks.push(pLine());
      }
      return blocks;
    }

    return pFile();
  }

  /* * */

  function eachBlock(x, cb) {
    if (x.isScript) {
      x.blocks.forEach(function(block) {
        eachBlock(block, cb);
      });
    } else if (x.isBlock) {
      cb(x);
      x.children.forEach(function(child) {
        eachBlock(child, cb);
      });
    }
  }

  var listBlocks = {
    "append:toList:": 1,
    "deleteLine:ofList:": 1,
    "insert:at:ofList:": 2,
    "setLine:ofList:to:": 1,
    "showList:": 0,
    "hideList:": 0,
  };

  function blockName(block) {
    var words = [];
    for (var i=0; i<block.children.length; i++) {
      var child = block.children[i];
      if (!child.isLabel) return;
      words.push(child.value);
    }
    return words.join(" ");
  }

  function recogniseStuff(scripts) {

    var customBlocksByHash = {};
    var listNames = {};

    scripts.forEach(function(script) {

      var customArgs = {};

      eachBlock(script, function(block) {
        // custom blocks
        if (block.info.shape === 'define-hat') {
          var outline = block.children[1];
          if (!outline) return;

          var names = [];
          var parts = [];
          for (var i=0; i<outline.children.length; i++) {
            var child = outline.children[i];
            if (child.isLabel) {
              parts.push(child.value);
            } else if (child.isBlock) {
              if (!child.info.argument) return;
              parts.push({
                number: "%n",
                string: "%s",
                boolean: "%b",
              }[child.info.argument]);

              var name = blockName(child);
              names.push(name);
              customArgs[name] = true;
            }
          }
          var spec = parts.join(" ");
          var hash = hashSpec(spec);
          var info = customBlocksByHash[hash] = {
            spec: spec,
            names: names,
          };
          block.info.selector = 'procDef';
          block.info.call = info.spec;
          block.info.names = info.names;
          block.info.category = 'custom';

        // custom arguments
        } else if (block.info.categoryIsDefault && block.info.category === 'variables') {
          var name = blockName(block);
          if (customArgs[name]) {
            block.info.category = 'custom-arg';
            block.info.categoryIsDefault = false;
          }

        // list names
        } else if (listBlocks.hasOwnProperty(block.info.selector)) {
          var argIndex = listBlocks[block.info.selector];
          var inputs = block.children.filter(function(child) {
            return !child.isLabel;
          });
          var input = inputs[argIndex];
          if (input.isInput) {
            listNames[input.value] = true;
          }
        }
      });
    });

    scripts.forEach(function(script) {
      eachBlock(script, function(block) {
        if (!block.info.categoryIsDefault) return;

        // custom blocks
        if (block.info.category === 'obsolete') {
          var info = customBlocksByHash[block.info.hash];
          if (info) {
            block.info.selector = 'call';
            block.info.call = info.spec;
            block.info.names = info.names;
            block.info.category = 'custom';
          }

        // list reporters
        } else if (block.info.category === 'variables') {
          var name = blockName(block);
          if (name && listNames[name]) {
            block.info.category = 'list';
            block.info.categoryIsDefault = false;
          }
        }
      });
    });
  }

  function parse(code, options) {
    var options = extend({
      inline: false,
      languages: ['en'],
    }, options);

    if (options.inline) {
      code = code.replace(/\n/g, ' ');
    }

    var languages = options.languages.map(function(code) {
      return allLanguages[code];
    });

    /* * */

    var f = parseLines(code, languages);
    var scripts = parseScripts(f);
    recogniseStuff(scripts);
    return scripts;
  }

  /*****************************************************************************/

  /* for constucting SVGs */

  var xml = new DOMParser().parseFromString('<xml></xml>',  "application/xml")
  function cdata(content) {
    return xml.createCDATASection(content);
  }

  function el(name, props) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    return setProps(el, props);
  }

  var directProps = {
    textContent: true,
  };
  function setProps(el, props) {
    for (var key in props) {
      var value = '' + props[key];
      if (directProps[key]) {
        el[key] = value;
      } else if (/^xlink:/.test(key)) {
        el.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
      } else if (props[key] !== null && props.hasOwnProperty(key)) {
        el.setAttributeNS(null, key, value);
      }
    }
    return el;
  }

  function withChildren(el, children) {
    for (var i=0; i<children.length; i++) {
      el.appendChild(children[i]);
    }
    return el;
  }

  function group(children) {
    return withChildren(el('g'), children);
  }

  function newSVG(width, height) {
    return el('svg', {
      version: "1.1",
      width: width,
      height: height,
    });
  }

  function polygon(props) {
    return el('polygon', extend(props, {
      points: props.points.join(" "),
    }));
  }

  function path(props) {
    return el('path', extend(props, {
      path: null,
      d: props.path.join(" "),
    }));
  }

  function text(x, y, content, props) {
    var text = el('text', extend(props, {
      x: x,
      y: y,
      textContent: content,
    }));
    return text;
  }

  function symbol(href) {
    return el('use', {
      'xlink:href': href,
    });
  }

  function translate(dx, dy, el) {
    setProps(el, {
      transform: ['translate(', dx, ' ', dy, ')'].join(''),
    });
    return el;
  }

  function translatePath(dx, dy, path) {
    var isX = true;
    var parts = path.split(" ");
    var out = [];
    for (var i=0; i<parts.length; i++) {
      var part = parts[i];
      if (part === 'A') {
        var j = i + 5;
        out.push('A');
        while (i < j) {
          out.push(parts[++i]);
        }
        continue;
      } else if (/[A-Za-z]/.test(part)) {
        assert(isX);
      } else {
        part = +part;
        part += isX ? dx : dy;
        isX = !isX;
      }
      out.push(part);
    }
    return out.join(" ");
  }


  /* shapes */

  function rect(w, h, props) {
    return el('rect', extend(props, {
      x: 0,
      y: 0,
      width: w,
      height: h,
    }));
  }

  function arc(p1x, p1y, p2x, p2y, rx, ry) {
    var r = p2y - p1y;
    return ["L", p1x, p1y, "A", rx, ry, 0, 0, 1, p2x, p2y].join(" ");
  }

  function arcw(p1x, p1y, p2x, p2y, rx, ry) {
    var r = p2y - p1y;
    return ["L", p1x, p1y, "A", rx, ry, 0, 0, 0, p2x, p2y].join(" ");
  }

  function roundedPath(w, h) {
    var r = h / 2;
    return [
      "M", r, 0,
      arc(w - r, 0, w - r, h, r, r),
      arc(r, h, r, 0, r, r),
      "Z"
    ];
  }

  function roundedRect(w, h, props) {
    return path(extend(props, {
      path: roundedPath(w, h),
    }));
  }

  function pointedPath(w, h) {
    var r = h / 2;
    return [
      "M", r, 0,
      "L", w - r, 0, w, r,
      "L", w, r, w - r, h,
      "L", r, h, 0, r,
      "L", 0, r, r, 0,
      "Z",
    ];
  }

  function pointedRect(w, h, props) {
    return path(extend(props, {
      path: pointedPath(w, h),
    }));
  }

  function getTop(w) {
    return ["M", 0, 3,
      "L", 3, 0,
      "L", 13, 0,
      "L", 16, 3,
      "L", 24, 3,
      "L", 27, 0,
      "L", w - 3, 0,
      "L", w, 3
    ].join(" ");
  }

  function getRingTop(w) {
    return ["M", 0, 3,
      "L", 3, 0,
      "L", 7, 0,
      "L", 10, 3,
      "L", 16, 3,
      "L", 19, 0,
      "L", w - 3, 0,
      "L", w, 3
    ].join(" ");
  }

  function getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === "undefined") {
      inset = 0;
    }
    var arr = ["L", w, y - 3,
      "L", w - 3, y
    ];
    if (hasNotch) {
      arr = arr.concat([
        "L", inset + 27, y,
        "L", inset + 24, y + 3,
        "L", inset + 16, y + 3,
        "L", inset + 13, y
      ]);
    }
    if (inset > 0) {
      arr = arr.concat([
        "L", inset + 2, y,
        "L", inset, y + 2
      ])
    } else {
      arr = arr.concat([
        "L", inset + 3, y,
        "L", 0, y - 3
      ]);
    }
    return arr.join(" ");
  }

  function getArm(w, armTop) {
    return [
      "L", 15, armTop - 2,
      "L", 15 + 2, armTop,
      "L", w - 3, armTop,
      "L", w, armTop + 3
    ].join(" ");
  }


  function stackRect(w, h, props) {
    return path(extend(props, {
      path: [
        getTop(w),
        getRightAndBottom(w, h, true, 0),
        "Z",
      ],
    }));
  }

  function capPath(w, h) {
    return [
      getTop(w),
      getRightAndBottom(w, h, false, 0),
      "Z",
    ];
  }

  function ringCapPath(w, h) {
    return [
      getRingTop(w),
      getRightAndBottom(w, h, false, 0),
      "Z",
    ];
  }

  function capRect(w, h, props) {
    return path(extend(props, {
      path: capPath(w, h),
    }));
  }

  function hatRect(w, h, props) {
    return path(extend(props, {
      path: [
        "M", 0, 12,
        arc(0, 12, 80, 10, 80, 80),
        "L", w - 3, 10, "L", w, 10 + 3,
        getRightAndBottom(w, h, true),
        "Z",
      ],
    }));
  }

  function curve(p1x, p1y, p2x, p2y, roundness) {
    var roundness = roundness || 0.42;
    var midX = (p1x + p2x) / 2.0;
    var midY = (p1y + p2y) / 2.0;
    var cx = Math.round(midX + (roundness * (p2y - p1y)));
    var cy = Math.round(midY - (roundness * (p2x - p1x)));
    return [cx, cy, p2x, p2y].join(" ");
  }

  function procHatBase(w, h, archRoundness, props) {
    // TODO use arc()
    var archRoundness = Math.min(0.2, 35 / w);
    return path(extend(props, {
      path: [
        "M", 0, 15,
        "Q", curve(0, 15, w, 15, archRoundness),
        getRightAndBottom(w, h, true),
        "M", -1, 13,
        "Q", curve(-1, 13, w + 1, 13, archRoundness),
        "Q", curve(w + 1, 13, w, 16, 0.6),
        "Q", curve(w, 16, 0, 16, -archRoundness),
        "Q", curve(0, 16, -1, 13, 0.6),
        "Z",
      ],
    }));
  }

  function procHatCap(w, h, archRoundness) {
    // TODO use arc()
    // TODO this doesn't look quite right
    return path({
      path: [
        "M", -1, 13,
        "Q", curve(-1, 13, w + 1, 13, archRoundness),
        "Q", curve(w + 1, 13, w, 16, 0.6),
        "Q", curve(w, 16, 0, 16, -archRoundness),
        "Q", curve(0, 16, -1, 13, 0.6),
        "Z",
      ],
      class: 'define-hat-cap',
    });
  }

  function procHatRect(w, h, props) {
    var q = 52;
    var y = h - q;

    var archRoundness = Math.min(0.2, 35 / w);

    return translate(0, y, group([
        procHatBase(w, q, archRoundness, props),
        procHatCap(w, q, archRoundness),
    ]));
  }

  function mouthRect(w, h, isFinal, lines, props) {
    var y = lines[0].height;
    var p = [
      getTop(w),
      getRightAndBottom(w, y, true, 15),
    ];
    for (var i=1; i<lines.length; i += 2) {
      var isLast = (i + 2 === lines.length);

      y += lines[i].height - 3;
      p.push(getArm(w, y));

      var hasNotch = !(isLast && isFinal);
      var inset = isLast ? 0 : 15;
      y += lines[i + 1].height + 3;
      p.push(getRightAndBottom(w, y, hasNotch, inset));
    }
    return path(extend(props, {
      path: p,
    }));
  }

  function ringRect(w, h, cy, cw, ch, shape, props) {
    var r = 8;
    var func = shape === 'reporter' ? roundedPath
             : shape === 'boolean' ? pointedPath
             : cw < 40 ? ringCapPath : capPath;
    return path(extend(props, {
      path: [
        "M", r, 0,
        arcw(r, 0, 0, r, r, r),
        arcw(0, h - r, r, h, r, r),
        arcw(w - r, h, w, h - r, r, r),
        arcw(w, r, w - r, 0, r, r),
        "Z",
        translatePath(4, cy || 4, func(cw, ch).join(" ")),
      ],
      'fill-rule': 'even-odd',
    }));
  }

  function commentRect(w, h, props) {
    var r = 6;
    return path(extend(props, {
      class: 'comment',
      path: [
        "M", r, 0,
        arc(w - r, 0, w, r, r, r),
        arc(w, h - r, w - r, h, r, r),
        arc(r, h, 0, h - r, r, r),
        arc(0, r, r, 0, r, r),
        "Z"
      ],
    }));
  }

  function commentLine(width, props) {
    return translate(-width, 9, rect(width, 2, extend(props, {
      class: 'comment-line',
    })));
  }

  /* definitions */

  var cssContent = "text{font-family:Lucida Grande,Verdana,Arial,DejaVu Sans,sans-serif;font-weight:700;fill:#fff;font-size:10px;word-spacing:+1px}.obsolete{fill:#d42828}.motion{fill:#4a6cd4}.looks{fill:#8a55d7}.sound{fill:#bb42c3}.pen{fill:#0e9a6c}.events{fill:#c88330}.control{fill:#e1a91a}.sensing{fill:#2ca5e2}.operators{fill:#5cb712}.variables{fill:#ee7d16}.list{fill:#cc5b22}.custom{fill:#632d99}.custom-arg{fill:#5947b1}.extension{fill:#4b4a60}.grey{fill:#969696}.bevel{filter:url(#bevelFilter)}.input{filter:url(#inputBevelFilter)}.input-number,.input-number-dropdown,.input-string{fill:#fff}.literal-dropdown,.literal-number,.literal-number-dropdown,.literal-string{font-weight:400;font-size:9px;word-spacing:0}.literal-number,.literal-number-dropdown,.literal-string{fill:#000}.darker{filter:url(#inputDarkFilter)}.outline{stroke:#fff;stroke-opacity:.2;stroke-width:2;fill:none}.define-hat-cap{stroke:#632d99;stroke-width:1;fill:#8e2ec2}.comment{fill:#ffffa5;stroke:#d0d1d2;stroke-width:1}.comment-line{fill:#ffff80}.comment-label{font-family:Helevetica,Arial,DejaVu Sans,sans-serif;font-weight:700;fill:#5c5d5f;word-spacing:0;font-size:12px}";

  function makeStyle() {
    var style = el('style');
    style.appendChild(cdata(cssContent));
    return style;
  }

  function makeIcons() {
    return [
      el('path', {
        d: "M1.504 21L0 19.493 4.567 0h1.948l-.5 2.418s1.002-.502 3.006 0c2.006.503 3.008 2.01 6.517 2.01 3.508 0 4.463-.545 4.463-.545l-.823 9.892s-2.137 1.005-5.144.696c-3.007-.307-3.007-2.007-6.014-2.51-3.008-.502-4.512.503-4.512.503L1.504 21z",
        fill: '#3f8d15',
        id: 'greenFlag',
      }),
      el('path', {
        d: "M6.724 0C3.01 0 0 2.91 0 6.5c0 2.316 1.253 4.35 3.14 5.5H5.17v-1.256C3.364 10.126 2.07 8.46 2.07 6.5 2.07 4.015 4.152 2 6.723 2c1.14 0 2.184.396 2.993 1.053L8.31 4.13c-.45.344-.398.826.11 1.08L15 8.5 13.858.992c-.083-.547-.514-.714-.963-.37l-1.532 1.172A6.825 6.825 0 0 0 6.723 0z",
        fill: '#fff',
        id: 'turnRight',
      }),
      el('path', {
        d: "M3.637 1.794A6.825 6.825 0 0 1 8.277 0C11.99 0 15 2.91 15 6.5c0 2.316-1.253 4.35-3.14 5.5H9.83v-1.256c1.808-.618 3.103-2.285 3.103-4.244 0-2.485-2.083-4.5-4.654-4.5-1.14 0-2.184.396-2.993 1.053L6.69 4.13c.45.344.398.826-.11 1.08L0 8.5 1.142.992c.083-.547.514-.714.963-.37l1.532 1.172z",
        fill: '#fff',
        id: 'turnLeft',
      }),
      el('path', {
        d: "M0 0L4 4L0 8Z",
        fill: '#111',
        id: 'addInput',
      }),
      el('path', {
        d: "M4 0L4 8L0 4Z",
        fill: '#111',
        id: 'delInput',
      }),
      setProps(group([
        el('path', {
          d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
          fill: '#000',
          opacity: '0.3',
        }),
        translate(-1, -1, el('path', {
          d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
          fill: '#fff',
          opacity: '0.9',
        })),
      ]), {
        id: 'loopArrow',
      }),
    ];
  }

  var Filter = function(id, props) {
    this.el = el('filter', extend(props, {
      id: id,
      x0: '-50%',
      y0: '-50%',
      width: '200%',
      height: '200%',
    }));
    this.highestId = 0;
  };
  Filter.prototype.fe = function(name, props, children) {
    var shortName = name.toLowerCase().replace(/gaussian|osite/, '');
    var id = [shortName, '-', ++this.highestId].join('');
    this.el.appendChild(withChildren(el("fe" + name, extend(props, {
      result: id,
    })), children || []));
    return id;
  }
  Filter.prototype.comp = function(op, in1, in2, props) {
    return this.fe('Composite', extend(props, {
      operator: op,
      in: in1,
      in2: in2,
    }));
  }
  Filter.prototype.subtract = function(in1, in2) {
    return this.comp('arithmetic', in1, in2, { k2: +1, k3: -1 });
  }
  Filter.prototype.offset = function(dx, dy, in1) {
    return this.fe('Offset', {
      in: in1,
      dx: dx,
      dy: dy,
    });
  }
  Filter.prototype.flood = function(color, opacity, in1) {
    return this.fe('Flood', {
      in: in1,
      'flood-color': color,
      'flood-opacity': opacity,
    });
  }
  Filter.prototype.blur = function(dev, in1) {
    return this.fe('GaussianBlur', {
      'in': 'SourceAlpha',
      stdDeviation: [dev, dev].join(' '),
    });
  }
  Filter.prototype.merge = function(children) {
    this.fe('Merge', {}, children.map(function(name) {
      return el('feMergeNode', {
        in: name,
      });
    }));
  }

  function bevelFilter(id, inset) {
    var f = new Filter(id);

    var alpha = 'SourceAlpha';
    var s = inset ? -1 : 1;
    var blur = f.blur(1, alpha);

    f.merge([
      'SourceGraphic',
      f.comp('in',
           f.flood('#fff', 0.15),
           f.subtract(alpha, f.offset(+s, +s, blur))
      ),
      f.comp('in',
           f.flood('#000', 0.7),
           f.subtract(alpha, f.offset(-s, -s, blur))
      ),
    ]);

    return f.el;
  }

  function darkFilter(id) {
    var f = new Filter(id);

    f.merge([
      'SourceGraphic',
      f.comp('in',
        f.flood('#000', 0.2),
        'SourceAlpha'),
    ]);

    return f.el;
  }

  function darkRect(w, h, category, el) {
    return setProps(group([
      setProps(el, {
        class: [category, 'darker'].join(' '),
      })
    ]), { width: w, height: h });
  }


  /* layout */

  function draw(o) {
    o.draw();
  }

  /* Label */

  var Label = function(value, cls) {
    this.value = value;
    this.cls = cls || '';
    this.el = null;
    this.width = null;
    this.height = 12;
    this.x = 0;
  };
  Label.prototype.isLabel = true;

  Label.prototype.measure = function() {
    // TODO measure multiple spaces
    this.el = text(0, 10, this.value, {
      class: this.cls,
    });
    if (this.value === "") {
      this.width = 0;
    } else if (this.value === " ") {
      this.width = 4.15625;
    } else {
      Label.measure(this);
    }
  };

  Label.prototype.draw = function() {
    return this.el;
  };

  Label.measuring = null;
  Label.toMeasure = [];

  Label.startMeasuring = function() {
    Label.measuring = setProps(newSVG(1, 1), {
      class: 'sb-measure',
    });
    Label.measuring.style.visibility = 'hidden';
    document.body.appendChild(Label.measuring);

    var defs = el('defs');
    Label.measuring.appendChild(defs);
    defs.appendChild(makeStyle());
  };
  Label.measure = function(label) {
    Label.measuring.appendChild(label.el);
    Label.toMeasure.push(label);
  };
  Label.endMeasuring = function(cb) {
    var measuring = Label.measuring;
    var toMeasure = Label.toMeasure;
    Label.measuring = null;
    Label.toMeasure = [];

    setTimeout(Label.measureAll.bind(null, measuring, toMeasure, cb), 0);
    //Label.measureAll(measuring, toMeasure, cb);
  };
  Label.measureAll = function(measuring, toMeasure, cb) {
    for (var i=0; i<toMeasure.length; i++) {
      var label = toMeasure[i];
      var bbox = label.el.getBBox();
      label.width = (bbox.width + 0.5) | 0;

      var trailingSpaces = / *$/.exec(label.value)[0].length || 0;
      for (var j=0; j<trailingSpaces; j++) {
        label.width += 4.15625;
      }
    }
    document.body.removeChild(measuring);
    cb();
  };


  /* Icon */

  var Icon = function(name) {
    this.name = name;
    this.isArrow = name === 'loopArrow';

    var info = Icon.icons[name];
    assert(info, "no info for icon " + name);
    extend(info, this);
  };
  Icon.prototype.isIcon = true;
  Icon.icons = {
    greenFlag: { width: 20, height: 21, dy: -2 },
    turnLeft: { width: 15, height: 12, dy: +1 },
    turnRight: { width: 15, height: 12, dy: +1 },
    loopArrow: { width: 14, height: 11 },
    addInput: { width: 4, height: 8 },
    delInput: { width: 4, height: 8 },
  };
  Icon.prototype.draw = function() {
    return symbol('#' + this.name, {
      width: this.width,
      height: this.height,
    });
  };


  /* Input */

  var Input = function(shape, value) {
    this.shape = shape;
    this.value = value;

    this.isRound = shape === 'number' || shape === 'number-dropdown';
    this.isBoolean = shape === 'boolean';
    this.isStack = shape === 'stack';
    this.isInset = shape === 'boolean' || shape === 'stack' || shape === 'reporter';
    this.isColor = shape === 'color';
    this.hasArrow = shape === 'dropdown' || shape === 'number-dropdown';
    this.isDarker = shape === 'boolean' || shape === 'stack' || shape === 'dropdown';

    this.hasLabel = !(this.isColor || this.isInset);
    this.label = this.hasLabel ? new Label(value, ['literal-' + this.shape]) : null;
    this.x = 0;
  };
  Input.prototype.isInput = true;

  Input.prototype.measure = function() {
    if (this.hasLabel) this.label.measure();
  };

  Input.shapes = {
    'string': rect,
    'number': roundedRect,
    'number-dropdown': roundedRect,
    'color': rect,
    'dropdown': rect,

    'boolean': pointedRect,
    'stack': stackRect,
    'reporter': roundedRect,
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
      setProps(el, {
        fill: this.value,
      });
    } else if (this.isDarker) {
      el = darkRect(w, h, parent.info.category, el);
    }

    var result = group([
      setProps(el, {
        class: ['input', 'input-'+this.shape].join(' '),
      }),
    ]);
    if (this.hasLabel) {
      var x = this.isRound ? 5 : 4;
      result.appendChild(translate(x, 0, label));
    }
    if (this.hasArrow) {
      var y = this.shape === 'dropdown' ? 5 : 4;
      result.appendChild(translate(w - 10, y, polygon({
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
    this.info = info;
    this.children = children;
    this.comment = comment || null;

    var shape = this.info.shape;
    this.isHat = shape === 'hat' || shape === 'define-hat';
    this.hasPuzzle = shape === 'stack' || shape === 'hat';
    this.isFinal = /cap/.test(shape);
    this.isCommand = shape === 'stack' || shape === 'cap' || /block/.test(shape);
    this.isOutline = shape === 'outline';
    this.isReporter = shape === 'reporter' || shape === 'embedded';
    this.isBoolean = shape === 'boolean';

    this.isRing = shape === 'ring';
    this.hasScript = /block/.test(shape);
    this.isElse = shape === 'celse';
    this.isEnd = shape === 'cend';

    this.x = 0;
  };
  Block.prototype.isBlock = true;

  Block.prototype.measure = function() {
    for (var i=0; i<this.children.length; i++) {
      var child = this.children[i];
      if (child.measure) child.measure();
    }
    if (this.comment) this.comment.measure();
  };

  Block.shapes = {
    'stack': stackRect,
    'c-block': stackRect,
    'if-block': stackRect,
    'celse': stackRect,
    'cend': stackRect,

    'cap': capRect,
    'reporter': roundedRect,
    'embedded': roundedRect,
    'boolean': pointedRect,
    'hat': hatRect,
    'define-hat': procHatRect,
    'ring': roundedRect,
  };

  Block.prototype.drawSelf = function(w, h, lines) {
    // mouths
    if (lines.length > 1) {
      return mouthRect(w, h, this.isFinal, lines, {
        class: [this.info.category, 'bevel'].join(' '),
      });
    }

    // outlines
    if (this.info.shape === 'outline') {
      return setProps(stackRect(w, h), {
        class: 'outline',
      });
    }

    // rings
    if (this.isRing) {
      var child = this.children[0];
      if (child && (child.isInput || child.isBlock || child.isScript)) {
        var shape = child.isScript ? 'stack'
                  : child.isInput ? child.shape : child.info.shape;
        return ringRect(w, h, child.y, child.width, child.height, shape, {
          class: [this.info.category, 'bevel'].join(' '),
        });
      }
    }

    var func = Block.shapes[this.info.shape];
    assert(func, "no shape func: " + this.info.shape);
    return func(w, h, {
      class: [this.info.category, 'bevel'].join(' '),
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
    'embedded':   [3, 4, 1],
    'boolean':    [3, 4, 2],
    'cap':        [6, 6, 2],
    'c-block':    [3, 6, 2],
    'if-block':   [3, 6, 2],
    'ring':       [4, 4, 2],
    null:         [4, 6, 2],
  };

  Block.prototype.draw = function() {
    var isDefine = this.info.shape === 'define-hat';

    var padding = Block.padding[this.info.shape] || Block.padding[null];
    var pt = padding[0],
        px = padding[1],
        pb = padding[2];

    var y = 0;
    var Line = function(y) {
      this.y = y;
      this.width = 0;
      this.height = 16;
      this.children = [];
    };

    var innerWidth = 0;
    var scriptWidth = 0;
    var line = new Line(y);
    function pushLine(isLast) {
      if (lines.length === 0) {
        line.height += pt + pb;
      } else {
        line.height = isLast ? 13 : 15;
        line.y -= 1;
      }
      y += line.height;
      lines.push(line);
    }

    var lines = [];
    for (var i=0; i<this.children.length; i++) {
      var child = this.children[i];
      child.el = child.draw(this);

      if (child.isScript && this.hasScript) {
        pushLine();
        child.y = y;
        lines.push(child);
        scriptWidth = Math.max(scriptWidth, Math.max(1, child.width));
        child.height = Math.max(12, child.height);
        if (child.isFinal) child.height += 3;
        y += child.height;
        line = new Line(y);
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

    var objects = [];

    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      if (line.isScript) {
        objects.push(translate(13, line.y, line.el));
        continue;
      }

      var h = line.height;

      for (var j=0; j<line.children.length; j++) {
        var child = line.children[j];
        if (child.isArrow) {
          objects.push(translate(innerWidth - 15, this.height - 3, child.el));
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
        objects.push(translate(px + child.x, line.y + y|0, child.el));
      }
    }

    var el = this.drawSelf(innerWidth, this.height, lines);
    objects.splice(0, 0, el);
    if (this.info.color) {
      setProps(el, {
        fill: this.info.color,
      });
    }

    return group(objects);
  };


  /* Comment */

  var Comment = function(value, hasBlock) {
    this.label = new Label(value, ['comment-label']);
    this.width = null;
    this.hasBlock = hasBlock;
  };
  Comment.prototype.isComment = true;
  Comment.lineLength = 12;
  Comment.prototype.height = 20;

  Comment.prototype.measure = function() {
    this.label.measure();
  };

  Comment.prototype.draw = function() {
    var labelEl = this.label.draw();

    this.width = this.label.width + 16;
    return group([
      commentLine(this.hasBlock ? Comment.lineLength : 0, 6),
      commentRect(this.width, this.height, {
        class: 'comment',
      }),
      translate(8, 4, labelEl),
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
      children.push(translate(inside ? 0 : 2, y, block.draw()));
      y += block.height;
      this.width = Math.max(this.width, block.width);

      var comment = block.comment;
      if (comment) {
        var cx = block.width + 2 + Comment.lineLength;
        var cy = y - (block.height / 2);
        var el = comment.draw();
        children.push(translate(cx, cy - comment.height / 2, el));
        this.width = Math.max(this.width, cx + comment.width);
      }
    }
    this.height = y;
    if (!inside && !this.isFinal) {
      this.height += 3;
    }
    return group(children);
  };


  /*****************************************************************************/

  function render(scripts, cb) {
    // measure strings
    Label.startMeasuring();
    scripts.forEach(function(script) {
      script.measure();
    });

    // finish measuring & render
    Label.endMeasuring(drawScripts.bind(null, scripts, cb));
  }

  function drawScripts(scripts, cb) {
    // render each script
    var width = 0;
    var height = 0;
    var elements = [];
    for (var i=0; i<scripts.length; i++) {
      var script = scripts[i];
      if (height) height += 10;
      elements.push(translate(0, height, script.draw()));
      height += script.height;
      width = Math.max(width, script.width + 4);
    }

    // return SVG
    var svg = newSVG(width, height);
    svg.appendChild(withChildren(el('defs'), [
        makeStyle(),
        bevelFilter('bevelFilter', false),
        bevelFilter('inputBevelFilter', true),
        darkFilter('inputDarkFilter'),
    ].concat(makeIcons())));

    svg.appendChild(group(elements));
    cb(svg);
  }

  function exportSVG(svg) {
    // TODO pad exported SVGs?
    return new XMLSerializer().serializeToString(svg);
  }

  /*** Render ***/

  // read code from a DOM element
  function readCode(el, options) {
    var options = extend({
      inline: false,
    }, options);

    var html = el.innerHTML.replace(/<br>\s?|\n|\r\n|\r/ig, '\n');
    var pre = document.createElement('pre');
    pre.innerHTML = html;
    var code = pre.textContent;
    if (options.inline) {
      code = code.replace('\n', '');
    }
    return code;
  }

  // insert 'svg' into 'el', with appropriate wrapper elements
  function replace(el, svg, scripts, options) {
    if (options.inline) {
      var container = document.createElement('span');
      var cls = "scratchblocks scratchblocks-inline";
      if (scripts[0] && !scripts[0].isEmpty) {
        cls += " scratchblocks-inline-" + scripts[0].blocks[0].shape;
      }
      container.className = cls;
      container.style.display = 'inline-block';
      container.style.verticalAlign = 'middle';
    } else {
      var container = document.createElement('div');
      container.className = "scratchblocks";
    }
    container.appendChild(svg);

    el.innerHTML = '';
    el.appendChild(container);
  }

  /* Render all matching elements in page to shiny scratch blocks.
   * Accepts a CSS selector as an argument.
   *
   *  scratchblocks.renderMatching("pre.blocks");
   *
   * Like the old 'scratchblocks2.parse().
   */
  var renderMatching = function (selector, options) {
    var selector = selector || "pre.blocks";
    var options = extend({
      inline: false,
      languages: ['en'],

      read: readCode, // function(el, options) => code
      parse: parse,   // function(code, options) => scripts
      render: render, // function(scripts, cb) => svg
      replace: replace, // function(el, svg, scripts, options)
    }, options);

    // find elements
    var results = [].slice.apply(document.querySelectorAll(selector));
    results.forEach(function(el) {
      var code = options.read(el, options);

      var scripts = options.parse(code, options);

      options.render(scripts, function(svg) {
        options.replace(el, svg, scripts, options);
      });
    });
  };



  return {
    allLanguages: allLanguages, // read-only
    loadLanguages: loadLanguages,

    Label: Label,
    Icon: Icon,
    Input: Input,
    Block: Block,
    Comment: Comment,
    Script: Script,

    read: readCode,
    parse: parse,
    render: render,
    replace: replace,
    renderMatching: renderMatching,
    exportSVG: exportSVG,
  };

}();
