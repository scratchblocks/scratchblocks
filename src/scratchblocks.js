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

  function assert(bool) {
    if (!bool) throw "Assertion failed!";
  }

  function extend(src, dest) {
    src = src || {};
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

  var overrideCategories = ["motion", "looks", "sound", "pen",
    "variables", "list", "events", "control", "sensing",
    "operators", "custom", "custom-arg", "extension", "grey",
    "obsolete"];
  var overrideFlags = ["cstart", "celse", "cend", "ring"];
  var overrideShapes = ["hat", "cap", "stack", "embedded",
    "boolean", "reporter"];

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

  // Build the English blocks.

  var scratchCommands = [];

  var english = {
    code: "en",

    aliases: {
      "turn left _ degrees": "turn @turnLeft _ degrees",
      "turn ccw _ degrees": "turn @turnLeft _ degrees",
      "turn ↺ _ degrees": "turn @turnLeft _ degrees",
      "turn right _ degrees": "turn @turnRight _ degrees",
      "turn cw _ degrees": "turn @turnRight _ degrees",
      "turn ↻ _ degrees": "turn @turnRight _ degrees",
      "when gf clicked": "when @greenFlag clicked",
      "when flag clicked": "when @greenFlag clicked",
      "when green flag clicked": "when @greenFlag clicked",
      "when ⚑ clicked": "when @greenFlag clicked",
    },

    define: ["define"],

    // For ignoring the lt sign in the "when distance < _" block
    ignorelt: ["when distance"],

    // Valid arguments to "of" dropdown, for resolving ambiguous situations
    math: ["abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "e ^", "10 ^"],

    // For detecting the "stop" cap / stack block
    osis: ["other scripts in sprite", "other scripts in stage"],

    commands: scratchCommands,
  };

  var image_text = {
    "turnRight": "↻",
    "turnLeft": "↺",
  };

  // The blockids are the same as english block text, so we build the blockid
  // list at the same time.

  var category = null;
  for (var i=0; i<englishCommands.length; i++) {
    if (englishCommands[i].length === 1) { // [category]
      category = english_blocks[i][0];
    } else {                              // [block id, [list of flags]]
      var block_and_flags = english_blocks[i],
          spec = block_and_flags[0], flags = block_and_flags[1];
      english.blocks.push(spec);

      blockids.push(spec); // Other languages will just provide a list of
      // translations, which is matched up with this
      // list.

      // Now store shape/category info.
      var info = {
        blockid: spec,
        category: category,
      };

      while (flags.length) {
        var flag = flags.pop();
        switch (flag) {
          case "hat":
          case "cap":
            info.shape = flag;
            break;
          default:
            assert(!info.flag);
            info.flag = flag;
        }
      }

      var image_match = /@([-A-z]+)/.exec(spec);
      if (image_match) {
        info.image_replacement = image_match[1];
      }

      block_info_by_id[spec] = info;
    }
  }

  // Built english, now add it.

  load_language(english);

  function load_language(language) {
    language = clone(language);

    var iso_code = language.code;
    delete language.code;

    // convert blocks list to a dict.
    var block_spec_by_id = {};
    for (var i=0; i<language.blocks.length; i++) {
      var spec = language.blocks[i],
          blockid = blockids[i];
      spec = spec.replace(/@[-A-z]+/, "@"); // remove images
      block_spec_by_id[blockid] = spec;

      // Add block to the text lookup dict.
      var minispec = minify(normalize_spec(spec));
      if (minispec) block_by_text[minispec] = {
        blockid: blockid,
        lang: iso_code,
      };
    }
    language.blocks = block_spec_by_id;

    // add aliases (for images)
    for (var text in language.aliases) {
      strings.aliases[text] = language.aliases[text];

      // Add alias to the text lookup dict.
      var minispec = minify(normalize_spec(text));
      block_by_text[minispec] = {
        blockid: language.aliases[text],
        lang: iso_code,
      };
    }

    // add stuff to strings
    for (var key in strings) {
      if (strings[key].constructor === Array) {
        for (i=0; i<language[key].length; i++) {
          if (language[key][i]) {
            strings[key].push(minify(language[key][i]));
          }
        }
      }
    }

    languages[iso_code] = language;
  }
  load_language = load_language;

  // Store initial state.
  var _init_strings = clone(strings);
  var _init_languages = clone(languages);
  var _init_block_by_text = clone(block_by_text);

  var reset_languages = function(language) {
    strings = clone(_init_strings);
    languages = clone(_init_languages);
    block_by_text = clone(_init_block_by_text);
  }

  // Hacks for certain blocks. TODO

  block_info_by_id["_ of _"].hack = function (info, args) {
    // Operators if math function, otherwise sensing "attribute of" block
    if (!args.length) return;
    var func = minify(strip_brackets(args[0]).replace(/ v$/, ""));
    if (func == "e^") func = "e ^";
    if (func == "10^") func = "10 ^";
    info.category = (strings.math.indexOf(func) > -1) ? "operators"
      : "sensing";
  }

  block_info_by_id["length of _"].hack = function (info, args) {
    // List block if dropdown, otherwise operators
    if (!args.length) return;
    info.category = (/^\[.* v\]$/.test(args[0])) ? "list"
      : "operators";
  }

  block_info_by_id["stop _"].hack = function (info, args) {
    // Cap block unless argument is "other scripts in sprite"
    if (!args.length) return;
    var what = minify(strip_brackets(args[0]).replace(/ v$/, ""));
    info.shape = (strings.osis.indexOf(what) > -1) ? null
      : "cap";
  }

  // Define function for getting block info by text.

  function find_block(spec, args) {
    var minitext = minify(spec);
    if (minitext in block_by_text) {
      var lang_and_id = block_by_text[minitext];
      var blockid = lang_and_id.blockid;
      var info = clone(block_info_by_id[blockid]);
      info.lang = lang_and_id.lang;
      if (info.image_replacement) {
        info.spec = languages[lang_and_id.lang].blocks[blockid];
      } else {
        if (spec === "..." || spec === "…") spec = ". . .";
        info.spec = spec;
      }
      if (info.hack) info.hack(info, args);
      return info;
    }
    if (spec.replace(/ /g, "") === "...") return find_block("...");
  }

  // Text minifying functions normalise block text before lookups.

  function remove_diacritics(text) {
    return text.replace("ß", "ss");
  }

  function minify(text) {
    var minitext = text.replace(/[.,%?:▶◀▸◂]/g, "").toLowerCase()
      .replace(/[ \t]+/g, " ").trim();
    if (!minitext && text.replace(" ", "") === "...") minitext = "...";
    return minitext;
  }

  // Insert padding around arguments in spec

  function normalize_spec(spec) {
    return spec.replace(/([^ ])_/g, "$1 _").replace(/_([^ ])/g, "_ $1");
  }

  // TODO recognise list reporters
  // TODO custom arguments
  // TODO definitions
  // TODO ignoreLt
  // TODO comparisons vs. predicates

  function parse(code) {
    return [];
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

  function roundedRect(w, h, props) {
    var r = h / 2;
    return path(extend(props, {
      path: [
        "M", r, 0,
        arc(w - r, 0, w - r, h, r, r),
        arc(r, h, r, 0, r, r),
        "Z"
      ],
    }));
  }

  function pointedRect(w, h, props) {
    var r = h / 2;
    return polygon(extend(props, {
      points: [
        r, 0,
        w - r, 0, w, r,
        w, r, w - r, h,
        r, h, 0, r,
        0, r, r, 0,
      ],
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

  function capRect(w, h, props) {
    return path(extend(props, {
      path: [
        getTop(w),
        getRightAndBottom(w, h, false, 0),
        "Z",
      ],
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

  /* definitions */

  var cssContent = "text{font-family:Lucida Grande,Verdana,Arial,DejaVu Sans,sans-serif;font-weight:700;fill:#fff;font-size:10px;word-spacing:+1px}.obsolete{fill:#d42828}.motion{fill:#4a6cd4}.looks{fill:#8a55d7}.sound{fill:#bb42c3}.pen{fill:#0e9a6c}.events{fill:#c88330}.control{fill:#e1a91a}.sensing{fill:#2ca5e2}.operators{fill:#5cb712}.variables{fill:#ee7d16}.list{fill:#cc5b22}.custom{fill:#632d99}.custom-arg{fill:#5947b1}.extension{fill:#4b4a60}.grey{fill:#969696}.bevel{filter:url(#bevelFilter)}.input{filter:url(#inputBevelFilter)}.input-number,.input-number-dropdown,.input-string{fill:#fff}.literal-dropdown,.literal-number,.literal-number-dropdown,.literal-string{font-weight:400;font-size:9px;word-spacing:0}.literal-number,.literal-number-dropdown,.literal-string{fill:#000}.darker{filter:url(#inputDarkFilter)}.outline{stroke:#fff;stroke-opacity:.2;stroke-width:2;fill:none}.define-hat-cap{stroke:#632d99;stroke-width:1;fill:#8e2ec2}";

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
    this.el = text(0, 10, value, {
      class: cls || '',
    });
    this.width = null;
    if (value === "") {
      this.width = 0;
    } else if (value === " ") {
      this.width = 4.15625;
    } else {
      Label.measure(this);
    }
    this.height = 12;
    this.x = 0;
  };
  Label.prototype.isLabel = true;

  Label.prototype.draw = function() {
    return this.el;
  };

  Label.measuring = null;
  Label.toMeasure = [];

  Label.startMeasuring = function() {
    Label.measuring = newSVG(1, 1);
    Label.measuring.classList.add('sb-measure');
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
    extend(info, this);
  };
  Icon.prototype.isIcon = true;
  Icon.icons = {
    greenFlag: { width: 20, height: 21, dy: -2 },
    turnLeft: { width: 15, height: 12, dy: +1 },
    turnRight: { width: 15, height: 12, dy: +1 },
    loopArrow: { width: 14, height: 11 },
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
    this.isColor = shape === 'color';
    this.hasArrow = shape === 'dropdown' || shape === 'number-dropdown';
    this.isDarker = shape === 'boolean' || shape === 'dropdown';

    this.hasLabel = !(this.isColor || this.isBoolean);
    this.label = this.hasLabel ? new Label(value, ['literal-' + this.shape]) : null;
    this.x = 0;
  };
  Input.prototype.isInput = true;

  Input.shapes = {
    'string': rect,
    'number': roundedRect,
    'number-dropdown': roundedRect,
    'color': rect,
    'dropdown': rect,
    'boolean': pointedRect,
  };

  Input.prototype.draw = function(parent) {
    if (this.hasLabel) {
      var label = this.label.draw();
      var w = Math.max(14, this.label.width + (this.shape === 'string' || this.shape === 'number-dropdown' ? 6 : 9));
    } else {
      var w = this.isBoolean ? 30 : this.isColor ? 13 : null;
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

  var Block = function(info, children) {
    this.info = info;
    this.children = children;
    assert(children.length);

    var shape = this.info.shape;
    this.isHat = shape === 'hat';
    this.hasPuzzle = shape === 'stack' || shape === 'hat';
    this.isFinal = /cap/.test(shape);
    this.isCommand = shape === 'stack' || shape === 'cap' || /block/.test(shape);
    this.isOutline = shape === 'outline';
    this.isReporter = shape === 'reporter' || shape === 'embedded';
    this.isBoolean = shape === 'boolean';
    this.hasScript = /block/.test(shape);

    this.x = 0;
  };
  Block.prototype.isBlock = true;

  Block.shapes = {
    'stack': stackRect,
    'cap': capRect,
    'reporter': roundedRect,
    'embedded': roundedRect,
    'boolean': pointedRect,
    'hat': hatRect,
    'define-hat': procHatRect,
  };

  Block.prototype.drawSelf = function(w, h, lines) {
    if (lines.length > 1) {
      return mouthRect(w, h, this.isFinal, lines, {
        class: [this.info.category, 'bevel'].join(' '),
      });
      // TODO rings
    }

    if (this.info.shape === 'outline') {
      return setProps(stackRect(w, h), {
        class: 'outline',
      });
    }

    var func = Block.shapes[this.info.shape];
    assert(func, "no shape func");
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
    null:         [4, 6, 2],
  };

  Block.prototype.draw = function() {
    var scriptIndent = 13;
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

      if (child.isScript) {
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
                          this.isCommand || this.isOutline ? 39 : 0);
    this.height = y;
    this.width = scriptWidth ? Math.max(innerWidth, scriptIndent + scriptWidth) : innerWidth;
    if (isDefine) {
      var p = Math.min(26, 3.5 + 0.13 * innerWidth | 0) - 18;
      this.height += p;
      pt += 2 * p;
    }

    var objects = [this.drawSelf(innerWidth, this.height, lines)];

    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      if (line.isScript) {
        objects.push(translate(scriptIndent, line.y, line.el));
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
        objects.push(translate(px + child.x, line.y + y|0, child.el));
      }
    }

    return group(objects);
  };


  /* Script */

  var Script = function(blocks) {
    this.blocks = blocks;
    this.isEmpty = !blocks.length;
    this.isFinal = !this.isEmpty && blocks[blocks.length - 1].isFinal;
    this.y = 0;
  };
  Script.prototype.isScript = true;

  Script.prototype.draw = function() {
    var children = [];
    var y = 0;
    this.width = 0;
    for (var i=0; i<this.blocks.length; i++) {
      var block = this.blocks[i];
      children.push(translate(2, y, block.draw()));
      y += block.height;
      this.width = Math.max(this.width, block.width);
    }
    this.height = y;
    if (!this.isFinal) {
      this.height += 3;
    }
    return group(children);
  };


  /*****************************************************************************/


  function render(scripts, cb) {
    Label.startMeasuring();

    // measure strings, then draw
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

  /* Render all matching elements in page to shiny scratch blocks.
   * Accepts a CSS selector as an argument.
   *
   *  scratchblocks.renderMatching("pre.blocks");
   *
   * Like the old 'scratchblocks2.parse().
   */
  var renderMatching = function (selector, options) {
    selector = selector || "pre.blocks";
    options = options || {
      inline: false,
    }

    // find elements
    var results = [].slice.apply(document.querySelectorAll(selector));
    results.forEach(function(el) {
      var html = el.innerHTML.replace(/<br>\s?|\n|\r\n|\r/ig, '\n');
      var pre = document.createElement('pre');
      pre.innerHTML = html;
      var code = pre.textContent;

      if (options.inline) {
        code = code.replace('\n', '');
      }

      var scripts = parse(code);
      render(scripts, function(svg) {
        var container = document.createElement('div');
        container.classList.add("sb");
        if (options.inline) container.classList.add('sb-inline');
        container.appendChild(svg);

        el.innerHTML = '';
        el.appendChild(container);
      });
    });
  };



  return {
    parse: parse,
    render: render,
    renderMatching: renderMatching,
    exportSVG: exportSVG,

    resetLanguages: reset_languages,
    loadLanguage: load_language,
    _findBlock: find_block,
  };

}();
