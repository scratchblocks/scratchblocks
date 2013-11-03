/*
 * scratchblocks2
 * http://github.com/blob8108/scratchblocks2
 *
 * Copyright 2013, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 */

/*
 * The following classes are used:
 *
 * Categories:
 *
 *     scratchblocks2-container
 *     inline-block
 *     script
 *     empty
 *
 * Comments:
 *
 *     comment
 *     attached
 *     to-hat
 *     to-reporter
 *
 * Shapes:
 *
 *     hat                |- Blocks  (These come from the database, the rest
 *     cap                |           come from the parsed code.)
 *
 *     stack              |
 *     embedded           |- Blocks
 *     boolean            |
 *
 *     reporter           |- This one's kinda weird.
 *
 *     string             |
 *     dropdown           |
 *     number             |
 *     number-dropdown    |- Inserts
 *     color              |
 *     define-hat         |
 *     outline            |
 *
 *     cstart |
 *     celse  |- Parser directives. (Used in the database to tell the parser
 *     cend   |                      to create the C blocks.)
 *
 *     cmouth |
 *     cwrap  |- Only used in the CSS code
 *     capend |
 *
 * Categories (colour):
 *
 *     motion
 *     looks
 *     sound
 *     pen
 *     variables
 *     list
 *
 *     events
 *     control
 *     sensing
 *     operators
 *
 *     custom
 *     custom-arg
 *     extension -- Sensor blocks
 *     grey -- for the ". . ." ellipsis block
 *
 *     obsolete
 *
 */

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function(substring) {
    return this.indexOf(substring) !== -1;
};


var scratchblocks2 = function ($) {
    "use strict";

    function assert(bool) {
        if (!bool) throw "Assertion failed!";
    }

    var sb2 = {}; // The module we export.



    /*** Database ***/

    // First, initialise the blocks database.

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

    var strings = sb2.strings = {
        aliases: {},

        define: [],
        ignorelt: [],
        math: [],
        osis: [],
    };

    var languages = sb2.languages = {};
    var block_info_by_id = {};
    var block_by_text = {};
    var blockids = []; // Used by load_language

    // Build the English blocks.

    var english = {
        code: "en",

        blocks: [], // These are defined just below

        aliases: {
            "turn left _ degrees": "turn @arrow-ccw _ degrees",
            "turn ccw _ degrees": "turn @arrow-ccw _ degrees",
            "turn right _ degrees": "turn @arrow-cw _ degrees",
            "turn cw _ degrees": "turn @arrow-cw _ degrees",
            "when gf clicked": "when @green-flag clicked",
            "when flag clicked": "when @green-flag clicked",
            "when green flag clicked": "when @green-flag clicked",
        },

        define: ["define"],

        // For ignoring the lt sign in the "when distance < _" block
        ignorelt: ["when distance"],

        // Valid arguments to "of" dropdown, for resolving ambiguous situations
        math: ["abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin",
               "acos", "atan", "ln", "log", "e ^", "10 ^"],

        // For detecting the "stop" cap / stack block
        osis: ["other scripts in sprite"],
    };

    var english_blocks = [
        ["motion"],

        ["move _ steps", []],
        ["turn @arrow-ccw _ degrees", []],
        ["turn @arrow-cw _ degrees", []],

        ["point in direction _", []],
        ["point towards _", []],

        ["go to x:_ y:_", []],
        ["go to _", []],
        ["glide _ secs to x:_ y:_", []],

        ["change x by _", []],
        ["set x to _", []],
        ["change y by _", []],
        ["set y to _", []],

        ["if on edge, bounce", []],

        ["set rotation style _", []],

        ["x position", []],
        ["y position", []],
        ["direction", []],



        ["looks"],

        ["say _ for _ secs", []],
        ["say _", []],
        ["think _ for _ secs", []],
        ["think _", []],

        ["show", []],
        ["hide", []],

        ["switch costume to _", []],
        ["next costume", []],
        ["switch backdrop to _", []],

        ["change _ effect by _", []],
        ["set _ effect to _", []],
        ["clear graphic effects", []],

        ["change size by _", []],
        ["set size to _%", []],

        ["go to front", []],
        ["go back _ layers", []],

        ["costume #", []],
        ["backdrop name", []],
        ["size", []],

        // Stage-specific

        ["switch backdrop to _ and wait", []],
        ["next backdrop", []],

        ["backdrop #", []],

        // Scratch 1.4

        ["switch to costume _", []],

        ["switch to background _", []],
        ["next background", []],
        ["background #", []],



        ["sound"],

        ["play sound _", []],
        ["play sound _ until done", []],
        ["stop all sounds", []],

        ["play drum _ for _ beats", []],
        ["rest for _ beats", []],

        ["play note _ for _ beats", []],
        ["set instrument to _", []],

        ["change volume by _", []],
        ["set volume to _%", []],
        ["volume", []],

        ["change tempo by _", []],
        ["set tempo to _ bpm", []],
        ["tempo", []],



        ["pen"],

        ["clear", []],

        ["stamp", []],

        ["pen down", []],
        ["pen up", []],

        ["set pen color to _", []],
        ["change pen color by _", []],
        ["set pen color to _", []],

        ["change pen shade by _", []],
        ["set pen shade to _", []],

        ["change pen size by _", []],
        ["set pen size to _", []],



        ["variables"],

        ["set _ to _", []],
        ["change _ by _", []],
        ["show variable _", []],
        ["hide variable _", []],



        ["list"],

        ["add _ to _", []],

        ["delete _ of _", []],
        ["insert _ at _ of _", []],
        ["replace item _ of _ with _", []],

        ["item _ of _", []],
        ["length of _", []],
        ["_ contains _", []],

        ["show list _", []],
        ["hide list _", []],



        ["events"],

        ["when @green-flag clicked", ["hat"]],
        ["when _ key pressed", ["hat"]],
        ["when this sprite clicked", ["hat"]],
        ["when backdrop switches to _", ["hat"]],

        ["when _ > _", ["hat"]],

        ["when I receive _", ["hat"]],
        ["broadcast _", []],
        ["broadcast _ and wait", []],



        ["control"],

        ["wait _ secs", []],

        ["repeat _", ["cstart"]],
        ["forever", ["cstart", "cap"]],
        ["if _ then", ["cstart"]],
        ["else", ["celse"]],
        ["end", ["cend"]],
        ["wait until _", []],
        ["repeat until _", ["cstart"]],

        ["stop _", ["cap"]],

        ["when I start as a clone", ["hat"]],
        ["create clone of _", []],
        ["delete this clone", ["cap"]],

        // Scratch 1.4

        ["if _", ["cstart"]],
        ["forever if _", ["cstart", "cap"]],
        ["stop script", ["cap"]],
        ["stop all", ["cap"]],



        ["sensing"],

        ["touching _?", []],
        ["touching color _?", []],
        ["color _ is touching _?", []],
        ["distance to _", []],

        ["ask _ and wait", []],
        ["answer", []],

        ["key _ pressed?", []],
        ["mouse down?", []],
        ["mouse x", []],
        ["mouse y", []],

        ["loudness", []],

        ["video _ on _", []],
        ["turn video _", []],
        ["set video transparency to _%", []],

        ["timer", []],
        ["reset timer", []],

        ["_ of _", []],

        ["current _", []],
        ["days since 2000", []],
        ["username", []],

        // Scratch 1.4

        ["loud?", []],



        ["operators"],

        ["_ + _", []],
        ["_ - _", []],
        ["_ * _", []],
        ["_ / _", []],

        ["pick random _ to _", []],

        ["_ < _", []],
        ["_ = _", []],
        ["_ > _", []],

        ["_ and _", []],
        ["_ or _", []],
        ["not _", []],

        ["join _ _", []],
        ["letter _ of _", []],
        ["length of _", []],

        ["_ mod _", []],
        ["round _", []],

        ["_ of _", []],



        ["extension"],

        ["when _", ["hat"]],
        ["sensor _?", []],
        ["_ sensor value", []],

        ["turn motor on for _ secs", []],
        ["turn motor on", []],
        ["turn motor off", []],
        ["set motor power _", []],
        ["set motor direction _", []],

        ["when distance < _", ["hat"]],
        ["when tilt = _", ["hat"]],
        ["distance", []],
        ["tilt", []],

        // Scratch 1.4

        ["motor on", []],
        ["motor off", []],
        ["motor on for _ seconds", []],
        ["motor power _", []],
        ["motor direction _", []],



        ["grey"],

        ["...", []],
        ["…", []],
    ];

    // The blockids are the same as english block text, so we build the blockid
    // list at the same time.

    var category = null;
    for (var i=0; i<english_blocks.length; i++) {
        if (english_blocks[i].length === 1) { // [category]
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
            var minispec = minify_spec(spec);
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
            block_by_text[minify_spec(text)] = {
                blockid: language.aliases[text],
                lang: iso_code,
            };
        }

        // add stuff to strings
        for (var key in strings) {
            if (strings[key].constructor === Array) {
                for (i=0; i<language[key].length; i++) {
                    strings[key].push(minify(language[key][i]));
                }
            }
        }

        languages[iso_code] = language;
    }

    sb2.load_language = load_language;

    // Hacks for certain blocks.

    block_info_by_id["_ of _"].hack = function (info, args) {
        // Operators if math function, otherwise sensing "attribute of" block
        if (!args.length) return;
        var func = minify(strip_brackets(args[0]).replace(/ v$/, ""));
        info.category = ($.inArray(func, strings.math) > -1) ? "operators"
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
        info.shape = ($.inArray(what, strings.osis) > -1) ? null
                                                          : "cap";
    }

    // Define function for getting block info by text.

    function find_block(spec, args) {
        var minitext = minify_spec(spec);
        if (minitext in block_by_text) {
            var lang_and_id = block_by_text[minitext];
            var blockid = lang_and_id.blockid;
            var info = clone(block_info_by_id[blockid]);
            if (info.image_replacement) {
                info.spec = languages[lang_and_id.lang].blocks[blockid];
            } else {
                info.spec = spec;
            }
            if (info.hack) info.hack(info, args);
            return info;
        }
    }

    // Utility function that copies a dictionary.

    function clone(dict) {
        var result = {};
        for (var key in dict) {
            result[key] = dict[key];
        }
        return result;
    }

    // Text minifying functions normalise block text before lookups.

    function remove_diacritics(text) {
        text = text.replace("ß", "ss");
        var map = diacritics_removal_map;
        for (var i = 0; i < map.length; i++) {
            text = text.replace(map[i].letters, map[i].base);
        }
        return text;
    }

    function minify(text) {
        var minitext = text.replace(/[ \t.,%?:]/g, "").toLowerCase();
        if (window.diacritics_removal_map) minitext = remove_diacritics(minitext);
        if (!minitext && text.replace(" ", "") === "...") minitext = "...";
        return minitext;
    }

    function minify_spec(text) {
        return minify(text).replace(/_/g, "");
    }



    /*** Parse block ***/

    var BRACKETS = "([<)]>";

    // Various bracket-related utilities...

    function is_open_bracket(chr) {
        var bracket_index = BRACKETS.indexOf(chr);
        return (-1 < bracket_index && bracket_index < 3);
    }

    function is_close_bracket(chr) {
        return (2 < BRACKETS.indexOf(chr));
    }

    function get_matching_bracket(chr) {
        return BRACKETS[BRACKETS.indexOf(chr) + 3];
    }

    // Strip one level of brackets from around a piece.

    function strip_brackets(code) {
        if (is_open_bracket(code[0])) {
            var bracket = code[0];
            if (code[code.length - 1] === get_matching_bracket(bracket)) {
                code = code.substr(0, code.length - 1);
            }
            code = code.substr(1);
        }
        return code;
    }

    // Split the block code into text and inserts based on brackets.

    function split_into_pieces(code) {
        var pieces = [],
            piece = "",
            matching_bracket = "",
            nesting = [];

        for (var i = 0; i < code.length; i++) {
            var chr = code[i];

            if (nesting.length > 0) {
                piece += chr;
                if (is_open_bracket(chr) && !is_lt_gt(code, i) &&
                        nesting[nesting.length - 1] !== "[") {
                    nesting.push(chr);
                    matching_bracket = get_matching_bracket(chr);
                } else if (chr === matching_bracket && !is_lt_gt(code, i)) {
                    nesting.pop();
                    if (nesting.length === 0) {
                        pieces.push(piece);
                        piece = "";
                    } else {
                        matching_bracket = get_matching_bracket(
                            nesting[nesting.length - 1]
                        );
                    }
                }
            } else {
                if (is_open_bracket(chr) && !is_lt_gt(code, i)) {
                    nesting.push(chr);
                    matching_bracket = get_matching_bracket(chr);

                    if (piece) {
                        pieces.push(piece);
                    }
                    piece = "";
                }
                piece += chr;
            }
        }
        if (piece) pieces.push(piece); // last piece
        return pieces;
    }

    // A piece is a block if it starts with a bracket.

    function is_block(piece) {
        return piece.length > 1 && is_open_bracket(piece[0]);
    }

    // Take block code and return block info object.

    function identify_block(code) {
        code = code.trim();

        var bracket;
        if (is_open_bracket(code.charAt(0))) {
            bracket = code.charAt(0);
            code = strip_brackets(code);
        }

        var pieces = split_into_pieces(code);

        var shape, isablock;
        if (pieces.length > 1 && bracket !== "[") {
            shape = get_block_shape(bracket);
            isablock = true;
        } else {
            shape = get_insert_shape(bracket, code);
            isablock = $.inArray(shape, ["reporter", "boolean", "stack"]) > -1;
            if (shape.contains("dropdown")) {
                code = code.substr(0, code.length - 2);
            }
        }

        // insert?
        if (!isablock) {
            return {
                shape: shape,
                pieces: [code],
            };
        }

        // trim ends
        if (pieces.length) {
            pieces[0] = pieces[0].replace(/^ +/, "");
            pieces[pieces.length-1] = pieces[pieces.length-1].replace(/ +$/, "");
        }

        // filter out block text & args
        var spec = "";
        var args = [];
        for (var i=0; i<pieces.length; i++) {
            var piece = pieces[i];
            if (is_block(piece)) {
                args.push(piece);
                spec += "_";
            } else {
                spec += piece;
            }
        }

        // define hat?
        for (var i=0; i<strings.define.length; i++) {;;
            var define_text = strings.define[i];
            if (pieces[0] && pieces[0].startsWith(define_text)) {
                pieces[0] = pieces[0].slice(define_text.length)
                                     .replace(/^ +/, "");
                return {
                    shape: "define-hat",
                    category: "custom",
                    define_text: define_text,
                    pieces: pieces,
                };
            }
        }

        // get category & related block info
        var info = find_block(spec, args);

        if (info) {
            // rebuild pieces in case text has changed
            var pieces = [];
            var text_parts = info.spec.split(/([_@])/);
            for (var i=0; i<text_parts.length; i++) {
                var part = text_parts[i];
                if (part === "_") {
                    part = parse_block(args.shift() || "");
                }
                if (part) pieces.push(part);
            }
            delete info.spec;
            delete info.args;
            info.pieces = pieces;
            if (!info.shape) info.shape = shape;
            if (info.flag === "cend") info.pieces = [""];
            return info;
        }

        // unknown block
        return {
            shape: shape,
            category: (shape === "reporter") ? "variables" : "obsolete",
            pieces: pieces,
        };
    }

    function parse_block(code) {
        // comment
        var comment;
        var comment_match = /^(.*[^:])?\/\/(.*)$/.exec(code);
        if (comment_match) {
            code = comment_match[1];
            comment = comment_match[2];
        }

        // parse block
        var info = identify_block(code);
        if (comment) info.comment = comment;

        // parse arguments
        var pieces = [];
        for (var i=0; i<info.pieces.length; i++) {
            var part = info.pieces[i];
            if (is_block(part)) part = parse_block(part);
            pieces.push(part);
        }
        info.pieces = pieces;

        return info;
    }

    // Functions to get shape from code.

    function get_block_shape(bracket) {
        switch (bracket) {
            case "(": return "embedded";
            case "<": return "boolean";
            default:  return "stack";
        }
    }

    function get_insert_shape(bracket, code) {
        switch (bracket) {
            case "(":
                if (/^(-?[0-9.]+( v)?)?$/i.test(code)) {
                    if (code.endsWith(" v")) {
                        return "number-dropdown";
                    } else {
                        return "number";
                    }
                } else if (code.endsWith(" v")) {
                    // rounded dropdowns (not actually number)
                    return "number-dropdown";
                } else {
                    // reporter (or embedded! TODO remove this comment)
                    return "reporter";
                }
            case "[":
                if (/^#[A-Fa-f0-9]{3,6}$/.test(code)) {
                    return "color";
                } else {
                    if (code.endsWith(" v")) {
                        return "dropdown";
                    } else {
                        return "string";
                    }
                }
            case "<":
                return "boolean";
            default:
                return "stack";
        }
    }

    function get_custom_arg_shape(bracket) {
        switch (bracket) {
            case "<": return "boolean";
            default:  return "reporter";
        }
    }

    // Check whether angle brackets are supposed to be lt/gt blocks.

    /*
     * We need a way to parse eg.
     *
     *      if <[6] < [3]> then
     *
     *  Obviously the central "<" should be ignored by split_into_pieces.
     *
     *  In addition, we need to handle blocks containing a lt symbol:
     *
     *      when distance < (30)
     *
     *  We do this by matching against `strings.ignorelt`.
     */

    // Returns true if it's lt/gt, false if it's an open/close bracket.

    function is_lt_gt(code, index) {
        var chr, i;

        if ((code[index] !== "<" && code[index] !== ">") ||
                index === code.length || index === 0) {
            return false;
        }

        // hat block containing lt symbol?
        for (var i=0; i<strings.ignorelt.length; i++) {
            var when_dist = strings.ignorelt[i];
            if (minify(code.substr(0, index)).startsWith(when_dist)) {
                return true; // don't parse as a boolean
            }
        }

        // look for open brackets ahead
        for (i = index + 1; i < code.length; i++) {
            chr = code[i];
            if (is_open_bracket(chr)) {
                break; // might be an innocuous lt/gt!
            }
            if (chr !== " ") {
                return false; // something else => it's a bracket
            }
        }

        // look for close brackets behind
        for (i = index - 1; i > -1; i--) {
            chr = code[i];
            if (is_close_bracket(chr)) {
                break; // must be an innocuous lt/gt!
            }
            if (chr !== " ") {
                return false; // something else => it's a bracket
            }
        }

        // we found a close bracket behind and an open bracket ahead, eg:
        //      ) < [
        return true; // it's an lt/gt block!
    }



    /*** Parse scripts ***/

    // Take scratchblocks text and turn it into useful objects.

    function parse_scripts(code) {
        return [];
    }



    /*** Render ***/

    /* Render all matching elements in page to shiny scratch blocks.
     * Accepts a CSS-style selector as an argument.
     *
     *  scratchblocks2.parse("pre.blocks");
     *
     */
    sb2.parse = function (selector, options) {
        selector = selector || "pre.blocks";
        options = options || {
            inline: false,
        }

        // find elements
        $(selector).each(function (i, el) {
            var $el = $(el),
                $container = $('<div>'),
                code,
                scripts,
                html = $el.html();

            html = html.replace(/<br>\s?|\n|\r\n|\r/ig, '\n');
            code = $('<pre>' + html + '</pre>').text();
            if (options.inline) {
                code = code.replace('\n', '');
            }
            scripts = render(code);

            $el.text("");
            $el.append($container);
            $container.addClass("scratchblocks2-container");
            if (options.inline) {
                $container.addClass("inline-block");
            }
            for (var i=0; i<scripts.length; i++) {
                var $script = scripts[i];
                $container.append($script);
            }
        });
    };

    /* Render script code to a list of DOM elements, one for each script. */
    function render(code) {
        var scripts = [],
            $script,
            $current,
            nesting = 0,
            lines = code.split(/\n/),
            line,
            $block,
            $cwrap,
            $cmouth,
            $comment,
            $last_comment,
            comment_text,
            one_only,
            $first,
            i;

        function add_cend($block, do_comment) {
            $cmouth = $current;
            $cwrap = $cmouth.parent();
            assert($cwrap.hasClass("cwrap"));

            $cwrap.append($block);
            $current = $cwrap.parent();
            nesting -= 1;

            // comment
            if ($comment && do_comment) {
                $cwrap.append($comment);
                $comment = null; // don't start multi-line comment
            }

            // give $block the color of $cwrap
            $block.removeClass(get_block_category($block));
            $block.addClass(get_block_category($cwrap));

            // check for cap blocks at end of cmouth
            if ($cmouth.find("> :last-child").hasClass("cap")) {
                $block.addClass("capend");
            }
        }

        function new_script() {
            // end any c blocks
            while (nesting > 0) {
                var $cend = $("<div><span>end</span></div>")
                        .addClass("stack").addClass("cend")
                        .addClass("control");
                $cend.category = "control";
                add_cend($cend, false);
            }

            // push script
            if ($script !== undefined && $script.children().length > 0) {
                scripts.push($script);
            }

            // start new script
            $script = $("<div>").addClass("script");
            $current = $script;
            nesting = 0;
            $last_comment = null;
        }
        new_script();

        for (i = 0; i < lines.length; i++) {
            line = lines[i];

            if (line.trim() === "") {
                // empty lines separate stacks
                if (nesting === 0) {
                    new_script();
                }
                continue;
            }

            // parse comment
            $comment = null;
            comment_text = null;
            if (line.indexOf("//") > -1) {
                comment_text = line.substr(line.indexOf("//") + 2).trim();
                line = line.substr(0, line.indexOf("//"));
            }

            // render block
            $block = render_block(parse_block(line), "stack");

            // render comment
            if ($block) {
                $last_comment = null;
            }

            if (comment_text) {
                if ($last_comment) {
                    $last_comment.children().text(
                        $last_comment.children().text() + "\n" + comment_text
                    );
                } else {
                    $comment = render_comment(comment_text);
                }
            }

            // append block to script
            if ($block) {
                one_only = false;
                if ($block.hasClass("hat") ||
                        $block.hasClass("define-hat")) {

                    new_script();

                    // comment
                    if ($comment) {
                        $comment.addClass("to-hat");

                        if ($block.hasClass("define-hat")) {
                            $comment.addClass("to-define-hat");
                        }
                    }
                } else if ($block.hasClass("boolean") ||
                           $block.hasClass("embedded") ||
                           $block.hasClass("reporter")) {
                    new_script();
                    one_only = true;

                    // comment
                    if ($comment) {
                        $comment.addClass("to-reporter");
                    }
                }

                // comment
                if ($comment) {
                    $comment.addClass("attached");
                }

                if ($block.hasClass("cstart")) {
                    $cwrap = $("<div>").addClass("cwrap");
                    $current.append($cwrap);
                    $cwrap.append($block);
                    $block.addClass("stack");

                    // comment
                    if ($comment) {
                        $cwrap.append($comment);
                        $comment = null; // don't start multi-line comment
                    }

                    $cmouth = $("<div>").addClass("cmouth");
                    $cwrap.append($cmouth);
                    $current = $cmouth;

                    // give $cwrap the color of $block
                    $cwrap.addClass(get_block_category($block));
                    $cwrap.category = get_block_category($block); // TODO

                    if ($block.hasClass("cap")) {
                        $cwrap.addClass("cap");
                        $block.removeClass("cap");
                    }

                    nesting += 1;

                } else if ($block.hasClass("celse")) {
                    if (nesting > 0) {
                        $cwrap = $current.parent();
                        assert($cwrap.hasClass("cwrap"));

                        $cwrap.append($block);

                        // comment
                        if ($comment) {
                            $cwrap.append($comment);
                            $comment = null; // don't start multi-line comment
                        }

                        // check for cap blocks at end of cmouth
                        $cmouth = $cwrap.find("."+"cmouth")
                        if ($cmouth.find("> :last-child").hasClass("cap")) {
                            $block.addClass("capend");
                        }

                        $cmouth = $("<div>").addClass("cmouth");
                        $cwrap.append($cmouth);
                        $current = $cmouth;

                        // give $block the color of $cwrap
                        $block.removeClass(get_block_category($block));
                        $block.addClass(get_block_category($cwrap));
                    } else {
                        $current.append($block);
                    }

                } else if ($block.hasClass("cend")) {
                    if (nesting > 0) {
                        add_cend($block, true);

                        if (nesting === 0 && $cwrap.hasClass("cap")) {
                            // finished a C cap block
                            new_script();
                        }
                    } else {
                        $current.append($block);
                    }
                } else {
                    $current.append($block);
                }

                if ($comment) {
                    if (/^category=[a-z]+$/i.test(comment_text)) {
                        var category = comment_text.substr(9);
                        // TODO if ($.inArray(category, CLASSES.category) > -1) {
                        $block.addClass(category);
                    } else {
                        $current.append($comment);
                    }
                }

                if (one_only || (nesting === 0 && $block.hasClass("cap"))) {
                    new_script();
                }

            } else {
                if ($comment) {
                    if (nesting > 0) {
                        $current.append($comment);
                    } else {
                        new_script();
                        $current.append($comment);
                        new_script();
                    }
                }
            }

            // for multi-line comments
            if ($comment) {
                $last_comment = $comment;
            }
        }

        // push last script
        new_script();


        var list_names = [],
            custom_blocks_text = [];

        // HACK list reporters
        for (i = 0; i < scripts.length; i++) {
            $script = scripts[i];
            $script.find(".list-dropdown").each(function (i, list) {
                var list_name = $(list).text();
                list_names.push(list_name);
            });
        }
        for (i = 0; i < scripts.length; i++) {
            $script = scripts[i];

            // HACK custom arg reporters
            var custom_arg_names = [];
            $first = $script.children().first();
            if ($first.hasClass("define-hat")) {
                $first.find(".custom-arg").each(function (i, arg) {
                    custom_arg_names.push($(arg).text());
                });

                // store custom definitions
                custom_blocks_text.push(
                    get_block_text($first.find(".outline").clone())
                );
            }

            // replace variable reporters
            $script.find(".variables.reporter").each(function (i, variable) {
                var $variable = $(variable);
                var var_name = $variable.text();
                if ($.inArray(var_name, custom_arg_names) > -1) {
                    $variable.removeClass("variables")
                             .addClass("custom-arg");
                } else if ($.inArray(var_name, list_names) > -1) {
                    $variable.removeClass("variables")
                             .addClass("list");
                }
            });
        }

        // HACK custom stack blocks
        for (i = 0; i < scripts.length; i++) {
            $script = scripts[i];
            $script.find(".obsolete.stack").each(function (i, block) {
                $block = $(block);
                var text = get_block_text($block.clone());
                if ($.inArray(text, custom_blocks_text) > -1) {
                    $block.removeClass("obsolete")
                          .addClass("custom");
                }
            });
        }

        return scripts;
    }

    /* Render comment to DOM element. */
    function render_comment(text) {
        var $comment = $(document.createElement("div")).addClass("comment")
                .append($(document.createElement("div"))
                .append(document.createTextNode(text.trim())));
        return $comment;
    }

    function render_block(info) {
        if (!code) return;

        // make DOM element
        var $block = $("<div>");
        $block.addClass(info.shape);
        $block.addClass(info.category);
        if (info.flag) $block.addClass(info.flag); // TODO remove
        $block.category = info.category; // TODO remove
        $block.shape = info.shape; // TODO remove

        // color inserts
        if (info.shape === "color") {
            $block.css({"background-color": info.pieces[0]});
            $block.text(" ");
            return $block;
        }

        // define hat?
        if (info.shape === "define-hat") {
            // "define"
            $block.append(document.createTextNode(info.define_text));

            // stack block outline
            var $outline = $("<div>").addClass("outline");
            $block.append($outline);

            for (var i=0; i<info.pieces.length; i++) {
                var piece = info.pieces[i];
                if (is_block(piece)) {
                    var $arg = $("<div>");
                    var shape = get_custom_arg_shape(piece.charAt(0));
                    $arg.addClass(shape);
                    $arg.addClass("custom-arg");
                    piece = strip_brackets(piece);
                    $arg.text(piece);
                    $outline.append($arg);
                } else {
                    if (!piece) piece = " ";
                    $outline.append(document.createTextNode(piece));
                }
            }

            return $block;
        }

        // empty?
        if (!info.pieces.length) {
            $block.addClass("empty");
            return $block;
        }

        // output text segments & args
        for (var i=0; i<info.pieces.length; i++) {
            var piece = info.pieces[i];
            if (typeof piece === "object") {
                $block.append(render_block(piece));
            } else if (piece === "@" && info.image_replacement) {
                var $image = $("<span>")
                $image.addClass(info.image_replacement);
                $block.append($image);
            } else {
                if (!piece) piece = " ";
                $block.append(document.createTextNode(piece));
            }
        }

        return $block;
    }

    /* Return the category class for the given block. */
    function get_block_category($block) {
        var CATEGORIES = ["obsolete", "control", "custom", "events", "list",
            "looks", "motion", "operators", "pen", "sensing", "sound",
            "variables", "extension", "grey"];
        for (var i=0; i<CATEGORIES.length; i++) {
            if ($block.hasClass(CATEGORIES[i])) {
                return CATEGORIES[i];
            }
        }
        return $block.category; // TODO
    }

    /* Return the shape class for the given insert. */
    function get_arg_shape($arg) {
        if (!$arg) {
            return "";
        }
        return $arg.shape; // TODO
    }

    /* Get text from $block DOM element. Make sure you clone the block first. */
    function get_block_text($block) {
        $block.children().remove();
        return minify($block.text());
    }

    return sb2; // export the module
}(jQuery);
