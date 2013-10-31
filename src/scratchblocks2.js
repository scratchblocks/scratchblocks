/*jslint bitwise: true, continue: true, plusplus: true, regexp: true, unparam: true, vars: true, browser: true, devel: true, indent: 4, maxerr: 100, maxlen: 80 */

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

/*Array.prototype.contains = function (thing) {
    return this.indexOf(thing) !== -1;
}*/


var scratchblocks2 = function ($) {
    "use strict";

    function assert(bool) {
        if (!bool) throw "Assertion failed!";
    }

    var sb2 = {}; // The module we export

    // First, initialise the blocks database.

    var strings = sb2.strings = {
        images: {},

        define: [],
        ignorelt: [],
        math: [],
        osis: [],
    };

    // Build the English blocks.

    var english = {
        code: "en",

        blocks: [], // These are defined just below

        images: {
            "left": "arrow-ccw",
            "ccw": "arrow-ccw",
            "right": "arrow-cw",
            "cw": "arrow-cw",
            "gf": "green-flag",
            "flag": "green-flag",
            "green flag": "green-flag",
        },

        define: ["define"],

        // For ignoring the lt sign in the "when distance < _" block
        ignorelt: ["whendistance"],

        // Valid arguments to "of" dropdown, for resolving ambiguous situations
        math: ["abs", "floor", "ceiling", "sqrt", "sin", "cos",
               "tan", "asin", "acos", "atan", "ln", "log", "e^", "10^"],

        // For detecting the "stop" cap / stack block
        osis: ["otherscriptsinsprite"],
    };

    var block_info_by_id = sb2.block_info_by_id = {};
    var blockid_by_text = {};
    var blockids = sb2.blockids = []; // Used by load_language
    var block_images_by_text = {};

    var english_blocks = [
        ["motion"],

        ["move_steps", []],
        ["turn@_degrees", ["@arrow-ccw", "@arrow-cw"]],

        ["pointindirection_", []],
        ["pointtowards_", []],

        ["gotox:_y:_", []],
        ["goto_", []],
        ["glide_secstox:_y:_", []],

        ["changexby_", []],
        ["setxto_", []],
        ["changeyby_", []],
        ["setyto_", []],

        ["ifonedge,bounce", []],

        ["setrotationstyle_", []],

        ["xposition", []],
        ["yposition", []],
        ["direction", []],



        ["looks"],

        ["say_for_secs", []],
        ["say_", []],
        ["think_for_secs", []],
        ["think_", []],

        ["show", []],
        ["hide", []],

        ["switchcostumeto_", []],
        ["nextcostume", []],
        ["switchbackdropto_", []],

        ["change_effectby_", []],
        ["set_effectto_", []],
        ["cleargraphiceffects", []],

        ["changesizeby_", []],
        ["setsizeto_%", []],

        ["gotofront", []],
        ["goback_layers", []],

        ["costume#", []],
        ["backdropname", []],
        ["size", []],

        // Stage-specific

        ["switchbackdropto_andwait", []],
        ["nextbackdrop", []],

        ["backdrop#", []],

        // Scratch 1.4

        ["switchtocostume_", []],

        ["switchtobackground_", []],
        ["nextbackground", []],
        ["background#", []],



        ["sound"],

        ["playsound_", []],
        ["playsound_untildone", []],
        ["stopallsounds", []],

        ["playdrum_for_beats", []],
        ["restfor_beats", []],

        ["playnote_for_beats", []],
        ["setinstrumentto_", []],

        ["changevolumeby_", []],
        ["setvolumeto_%", []],
        ["volume", []],

        ["changetempoby_", []],
        ["settempoto_bpm", []],
        ["tempo", []],



        ["pen"],

        ["clear", []],

        ["stamp", []],

        ["pendown", []],
        ["penup", []],

        ["setpencolorto_", []],
        ["changepencolorby_", []],
        ["setpencolorto_", []],

        ["changepenshadeby_", []],
        ["setpenshadeto_", []],

        ["changepensizeby_", []],
        ["setpensizeto_", []],



        ["variables"],

        ["set_to_", []],
        ["change_by_", []],
        ["showvariable_", []],
        ["hidevariable_", []],



        ["list"],

        ["add_to_", []],

        ["delete_of_", []],
        ["insert_at_of_", []],
        ["replaceitem_of_with_", []],

        ["item_of_", []],
        ["lengthof_", []],
        ["_contains_", []],

        ["showlist_", []],
        ["hidelist_", []],



        ["events"],

        ["when@clicked", ["hat", "@green-flag"]],
        ["when_keypressed", ["hat"]],
        ["whenthisspriteclicked", ["hat"]],
        ["whenbackdropswitchesto_", ["hat"]],

        ["when_>_", ["hat"]],

        ["whenireceive_", ["hat"]],
        ["broadcast_", []],
        ["broadcast_andwait", []],



        ["control"],

        ["wait_secs", []],

        ["repeat_", ["cstart"]],
        ["forever", ["cstart", "cap"]],
        ["if_then", ["cstart"]],
        ["else", ["celse"]],
        ["end", ["cend"]],
        ["waituntil_", []],
        ["repeatuntil_", ["cstart"]],

        ["stop_", ["cap"]],

        ["whenistartasaclone", ["hat"]],
        ["createcloneof_", []],
        ["deletethisclone", ["cap"]],

        // Scratch 1.4

        ["if_", ["cstart"]],
        ["foreverif_", ["cstart", "cap"]],
        ["stopscript", ["cap"]],
        ["stopall", ["cap"]],



        ["sensing"],

        ["touching_?", []],
        ["touchingcolor_?", []],
        ["color_istouching_?", []],
        ["distanceto_", []],

        ["ask_andwait", []],
        ["answer", []],

        ["key_pressed?", []],
        ["mousedown?", []],
        ["mousex", []],
        ["mousey", []],

        ["loudness", []],

        ["video_on_", []],
        ["turnvideo_", []],
        ["setvideotransparencyto_%", []],

        ["timer", []],
        ["resettimer", []],

        ["_of_", []],

        ["current_", []],
        ["dayssince2000", []],
        ["username", []],

        // Scratch 1.4

        ["loud?", []],



        ["operators"],

        ["_+_", []],
        ["_-_", []],
        ["_*_", []],
        ["_/_", []],

        ["pickrandom_to_", []],

        ["_<_", []],
        ["_=_", []],
        ["_>_", []],

        ["_and_", []],
        ["_or_", []],
        ["not_", []],

        ["join__", []],
        ["letter_of_", []],
        ["lengthof_", []],

        ["_mod_", []],
        ["round_", []],

        ["_of_", []],



        ["extension"],

        ["when_", ["hat"]],
        ["sensor_?", []],
        ["_sensorvalue", []],

        ["turnmotoronfor_secs", []],
        ["turnmotoron", []],
        ["turnmotoroff", []],
        ["setmotorpower_", []],
        ["setmotordirection_", []],

        ["whendistance<_", ["hat"]],
        ["whentilt=_", ["hat"]],
        ["distance", []],
        ["tilt", []],

        // Scratch 1.4

        ["motoron", []],
        ["motoroff", []],
        ["motoronfor_seconds", []],
        ["motorpower_", []],
        ["motordirection_", []],



        ["grey"],

        ["...", []],
        ["…", []],
    ];

    var category = null;
    for (var i=0; i<english_blocks.length; i++) {
        if (english_blocks[i].length === 1) {
            category = english_blocks[i][0];
        } else {
            var block_and_flags = english_blocks[i],
                spec = block_and_flags[0], flags = block_and_flags[1];
            english.blocks.push(spec);
            blockids.push(spec);
            block_info_by_id[spec] = {
                blockid: spec,
                category: category,
                flags: flags,
            };
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
            blockid_by_text[minify_spec(spec)] = blockid;
            block_spec_by_id[blockid] = spec;
        }
        language.blocks = block_spec_by_id;

        // add stuff to strings
        strings.define = strings.define.concat(language.define);
        strings.math = strings.math.concat(language.math);
        strings.osis = strings.osis.concat(language.osis);
        strings.ignorelt = strings.ignorelt.concat(language.ignorelt);
        for (var text in language.images) {
            strings.images[text] = language.images[text];
        }
    }

    // Hacks for certain blocks.

    block_info_by_id["_of_"].hack = function (info, args) {
        // Operators if math function, otherwise sensing "attribute of" block
        if (!args.length) return;
        var func = minify(strip_brackets(args[0]).replace(/ v$/, ""));
        info.category = ($.inArray(func, strings.math) > -1) ? "operators"
                                                             : "sensing";
    }

    block_info_by_id["lengthof_"].hack = function (info, args) {
        // List block if dropdown, otherwise operators
        if (!args.length) return;
        info.category = (/^\[.* v\]$/.test(args[0])) ? "list"
                                                     : "operators";
    }

    block_info_by_id["stop_"].hack = function (info, args) {
        // Cap block unless argument is "other scripts in sprite"
        if (!args.length) return;
        var what = minify(strip_brackets(args[0]).replace(/ v$/, ""));
        info.flags = ($.inArray(what, strings.osis) > -1) ? []
                                                          : ["cap"];
    }

    // Define function for getting block info by text.

    function find_block(text, args) {
        // Simple lookup.
        var minitext = minify_spec(text);
        if (minitext in blockid_by_text) {
            var blockid = blockid_by_text[minitext];
            var info = clone(block_info_by_id[blockid]);
            info.text = text;
            if (info.hack) info.hack(info, args);
            return info;
        }

        // Use image replacements.
        for (var image_text in strings.images) {
            if (text.indexOf(image_text) > -1) {
                var new_text = text.replace(image_text, "@"),
                    blockid = blockid_by_text[minify_spec(new_text)];
                if (blockid in block_info_by_id) {
                    var info = clone(block_info_by_id[blockid]),
                        image = strings.images[image_text];
                    if ($.inArray("@"+image, info.flags) > -1) {
                        info.text = new_text;
                        info.image_replacement = image;
                        return info;
                    }
                }
            }
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
        text = text.replace(/[ \t,%?:]/g, "").toLowerCase();
        if (window.diacritics_removal_map) text = remove_diacritics(text);
        return text;
    }

    function minify_spec(text) {
        return minify(text).replace(/_/g, "");
    }



    /*** Parser ***/

    var BRACKETS = "([<)]>";

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
            $block = render_block(line, "stack");

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

    function is_block(piece) {
        return piece.length > 1 && (
            is_open_bracket(piece[0]) || is_close_bracket(piece[0])
        );
    }

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

    function parse_block(code) {
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
            //if (shape !== "string") code = code.trim();
            return {
                shape: shape,
                pieces: [code],
            };
            // TODO put free-floating inserts inside a stack block
        }

        // trim ends
        if (pieces.length) {
            pieces[0] = pieces[0].replace(/^ +/, "");
            pieces[pieces.length-1] = pieces[pieces.length-1].replace(/ +$/, "");
        }

        // filter out block text & args
        var text = "";
        var args = [];
        for (var i=0; i<pieces.length; i++) {
            var piece = pieces[i];
            if (is_block(piece)) {
                args.push(piece);
                text += "_";
            } else {
                text += piece;
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
        var info = find_block(text, args);

        if (info) {
            // rebuild pieces in case text has changed
            var pieces = [];
            var text_parts = info.text.split(/([_@])/);
            for (var i=0; i<text_parts.length; i++) {
                var part = text_parts[i];
                if (part === "_") part = args.shift();
                if (part.length) pieces.push(part);
            }
            delete info.text;
            delete info.args;
            info.pieces = pieces;
            if (!info.shape) info.shape = shape;
            if ($.inArray("cend", info.flags) > -1) info.pieces = [""];
            return info;
        }

        // unknown block
        return {
            shape: shape,
            category: (shape === "reporter") ? "variables" : "obsolete",
            pieces: pieces,
        };
    }

    function render_block(code) {
        if (!code) return;

        var info = parse_block(code);

        // make DOM element
        var $block = $("<div>");
        $block.addClass(info.shape);
        $block.addClass(info.category);
        if (info.flags) {
            for (var i=0; i<info.flags.length; i++) { // TODO
                $block.addClass(info.flags[i]);
            }
        }
        $block.category = info.category; // TODO
        $block.shape = info.shape; // TODO

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
            if (is_block(piece)) {
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

    /* Split the block code into text and insert pieces.
     *
     * Inserts start with a bracket.
     */
    function split_into_pieces(code) {
        var pieces = [],
            piece = "",
            matching_bracket = "",
            nesting = [],
            chr,
            i;

        for (i = 0; i < code.length; i++) {
            chr = code[i];

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

        // last piece
        if (piece) {
            pieces.push(piece);
        }

        return pieces;
    }

    /* Strip one level of surrounding <([ brackets from scratchblocks code */
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

    /* Stop lt/gt signs between open/close brackets being seen as open/close
     * brackets. Makes sure booleans are parsed properly.
     *
     * Returns true if it's lt/gt, as there is a close bracket behind and an
     * open bracket ahead:
     *      ) < [
     *
     * Returns false otherwise, if it's an open/close bracket itself:
     *      <(      ...etc
     */
    function is_lt_gt(code, index) {
        var chr, i;

        if ((code[index] !== "<" && code[index] !== ">") ||
                index === code.length ||
                index === 0) {
            return false;
        }

        // HACK: "when distance < _)" block
        for (var i=0; i<strings.ignorelt.length; i++) {
            var when_dist = strings.ignorelt[i];
            if (minify(code.substr(0, index)).startsWith(when_dist)) {
                return true; // don't parse as a boolean
            }
        }

        for (i = index + 1; i < code.length; i++) {
            chr = code[i];
            if (is_open_bracket(chr)) {
                break; // might be an innocuous lt/gt!
            }
            if (chr !== " ") {
                return false; // something else => it's a bracket
            }
        }

        for (i = index - 1; i > -1; i--) {
            chr = code[i];
            if (is_close_bracket(chr)) {
                break; // must be an innocuous lt/gt!
            }
            if (chr !== " ") {
                return false; // something else => it's a bracket
            }
        }

        // it's an lt/gt sign!
        return true;
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
