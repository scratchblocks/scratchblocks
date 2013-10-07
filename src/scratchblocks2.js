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
 *     list-dropdown
 *
 * Comments:
 *
 *     comment
 *     attached
 *     to-hat
 *     to-reporter
 *
 * Internal use only:
 *
 *     math-function
 *
 * Shapes:
 *
 *     hat
 *     cap
 *     stack
 *     embedded
 *     reporter
 *     boolean
 *     string
 *     dropdown
 *     number
 *     number-dropdown
 *     color
 *     custom-definition
 *     custom-arg
 *     outline
 *
 *     cstart
 *     cmouth
 *     cwrap
 *     celse
 *     cend
 *     ifblock
 *     capend
 *
 * Categories (colour):
 *
 *     obsolete
 *
 *     control
 *     custom
 *     events
 *     list
 *     looks
 *     motion
 *     operators
 *     pen
 *     sensing
 *     sound
 *     variables
 *     purple -- Sensor blocks
 *     grey -- for the ". . ." ellipsis block
 *
 */

var scratchblocks2 = function ($) {
    "use strict";

    var sb2 = {}, // The module we export

        // Bracket characters
        BRACKETS = "([<)]>",

        // Valid arguments to "of" dropdown, for resolving ambiguous situations
        MATH_FUNCTIONS = ["abs", "floor", "ceiling", "sqrt", "sin", "cos",
                "tan", "asin", "acos", "atan", "ln", "log", "e^", "10^"],

        // List of insert classes -- don't call find_block on these
        DATA_INSERTS = ["string", "dropdown", "number", "number-dropdown",
                "color"],

        // List of classes for get_arg_shape
        ARG_SHAPES = ["reporter", "embedded", "boolean", "string", "dropdown",
                "number", "number-dropdown",

                // special shapes:
                "list-dropdown", "math-function"],

        // The list of blocks
        blocks_db,

        // Used to keep a copy of sb2.blocks, so we can detect changes
        blocks_original;


    function assert(bool) {
        if (!bool) throw "Assertion failed!";
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

        // HACK: "when distance < (20)" block
        if (/^whendistance$/i.test(strip_block_text(code.substr(0, index)))) {
            return true; // don't parse as boolean
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

    /* Return the category class for the given block. */
    function get_block_category($block) {
        var block_category;
        $.each(CLASSES.category, function (i, category) {
            if ($block.hasClass(category)) {
                block_category = category;
            }
        });
        return block_category;
    }

    /* Return the shape class for the given insert. */
    function get_arg_shape($arg) {
        if (!$arg) {
            return "";
        }
        var arg_shape;
        $.each(ARG_SHAPES, function (i, shape) {
            if ($arg.hasClass(shape)) {
                arg_shape = shape;
            }
        });
        return arg_shape;
    }

    /* Strip block text, for looking up in blocks db. */
    function strip_block_text(text) {
        var map = diacritics_removal_map,
            i;
        text = text.replace(/[ ,%?:]/g, "").toLowerCase();
        text = text.replace("\u00DF", "ss");
        for (i = 0; i < map.length; i++) {
            text = text.replace(map[i].letters, map[i].base);
        }
        return text;
    }

    /* Get text from $block DOM element. Make sure you clone the block first. */
    function get_block_text($block) {
        $block.children().remove();
        return strip_block_text($block.text());
    }

    /* Parse the blocks database. */
    function load_blocks_db() {
        var db = {},
            category = "";

        // newlines are escaped, so split at double-space instead
        $.each(sb2.blocks.split(/ {2}|\n|\r/), function (i, line) {
            line = line.trim();
            if (line.length === 0 || line.indexOf("//") === 0) {
                return; // continue
            }

            var classes = [category],
                commentIndex = line.indexOf("##"),
                extra,
                $block,
                arg_shapes,
                text,
                block;

            // get category comment
            if (commentIndex === 0) {
                category = line.replace(/##/g, "").trim().toLowerCase();
                return; // continue
            }
            if (commentIndex > 0) {
                extra = line.substr(commentIndex + 2).trim();
                line = line.substr(0, commentIndex);
                line = line.trim();
                classes = classes.concat(extra.split(" "));
            }

            // parse block
            $block = render_block(line, "database:stack");

            // get arg shapes
            arg_shapes = [];
            $block.children().each(function (i, arg) {
                arg_shapes.push(get_arg_shape($(arg)));
            });

            // get text
            $block.children().remove();
            text = $block.text();
            text = strip_block_text(text);

            // add block
            block = [classes, arg_shapes];
            if (db[text] === undefined) {
                db[text] = [];
            }
            db[text].push(block);
        });

        blocks_db = db;

        // DEBUG
        sb2.blocks_db = blocks_db;

        // keep a reference to the blocks definition, in case it changes.
        blocks_original = sb2.blocks;
    }

    /* Return the blocks database, loading it first if needed. */
    function get_blocks_db() {
        if (blocks_original === undefined ||
                blocks_original !== sb2.blocks) {
            // blocks code has changed, parse it again!
            load_blocks_db();
        }
        return blocks_db;
    }

    /* Return true if given $arg fits into insert of given shape. */
    function arg_fits_shape($arg, insert_shape) {
        var arg_shape = get_arg_shape($arg);

        if (!$arg) {
            return false;
        }

        if (arg_shape === insert_shape) {
            return true;
        }

        if ($.inArray(arg_shape, ["reporter", "embedded"]) !== -1) {
            arg_shape = "block";
        }

        switch (insert_shape) {
            case "math-function":
                // check is valid math function
                var func = $arg.text().replace(/[ ]/g, "")
                        .toLowerCase();
                return $.inArray(func, MATH_FUNCTIONS) !== -1;

            case "dropdown":
                return arg_shape == "block";

            case "number":
                return $.inArray(arg_shape, ["block", "string"]) !== -1;

            case "string":
                return $.inArray(arg_shape, ["block", "number"]) !== -1;

            default:
                return false;
        }
    }

    /* Return [classes, arg_shapes] for a block, given its text. Uses args as
     * hints. */
    function find_block(text, $arg_list) {
        // strip block text
        text = strip_block_text(text);

        var blocks = get_blocks_db(),
            block,
            poss_blocks,
            classes = [],
            arg_classes = [];

        poss_blocks = blocks[text];

        // get block for text
        if (poss_blocks !== undefined) {
            if (poss_blocks.length > 1) {
                // choose based on args
                $.each(poss_blocks, function (i, poss_block) {
                    var category = poss_block[0][0],
                        need_args = poss_block[1],
                        fits = true,
                        j;

                    for (j = 0; j < need_args.length; j++) {
                        if (!arg_fits_shape($arg_list[j], need_args[j])) {
                            fits = false;
                            break;
                        }
                    }

                    if (fits) {
                        block = poss_block;
                    }
                });
            }

            if (block === undefined) {
                block = poss_blocks[0]; // In case none of them fit properly
            }
        }

        // HACK: scratch 1.4 "when ... clicked" block
        if (block === undefined) {
            if (/^when.*clicked$/.test(text)) {
                if (blocks["whenthisspriteclicked"]) {
                    block = blocks["whenthisspriteclicked"][0];
                }
            }
        }

        if (block) {
            classes = block[0];

            // tag list dropdowns
            $.each(block[1], function (i, shape) {
                if (shape === "list-dropdown" || shape === "math-function") {
                    arg_classes.push(shape);
                } else {
                    arg_classes.push("");
                }
            });
        }

        return [classes, arg_classes];
    }

    /* Render script code to DOM. */
    function render_block(code, need_shape) {
        var $block = $("<div>"),
            shape,
            is_database = false,
            category = "",
            bracket = "",
            is_dropdown = false,
            pieces = [],
            text = "",
            classes = [];

        // init vars
        if (/^database:?/.test(need_shape)) {
            is_database = true;
            need_shape = need_shape.substr(9);
        }
        if (need_shape === undefined) {
            need_shape = "";
        }
        shape = need_shape;

        // trim
        code = code.trim();
        if (code === "") {
            return;
        }

        if (need_shape === "stack" && split_into_pieces(code).length > 1) {
            // not an insert!
        } else {
            // strip brackets
            if (is_open_bracket(code[0])) {
                bracket = code[0];
                code = strip_brackets(code);
            }

            // trim again
            if (bracket !== "[") {
                code = code.trim();
            }
        }

        // check for custom block definition
        if (/^define/i.test(code)) {
            shape = "custom-definition";
            code = code.substr(6).trim();
        }

        if (bracket === "[") {
            // make sure it's an insert
            pieces = [code];
        } else {
            // split into pieces
            pieces = split_into_pieces(code);
        }

        // check shape
        if (shape !== "custom-definition") {
            if (pieces.length > 1) {
                // block
                switch (bracket) {
                    case "(":
                        shape = "embedded";
                        break;

                    case "<":
                        shape = "boolean";
                        break;

                    default:
                        assert(shape === "stack");
                        break;
                }
            } else {
                // insert
                switch (bracket) {
                    case "(":
                        if (/^(-?[0-9.]+( v)?)?$/i.test(code)) {
                            // number
                            shape = "number";

                            // dropdown?
                            if (/ v$/i.test(code)) {
                                is_dropdown = true;
                                code = code.substr(0, code.length - 2);
                                shape = "number-dropdown";
                            }
                        } else if (/ v$/i.test(code)) {
                            // rounded dropdowns
                            is_dropdown = true;
                            code = code.substr(0, code.length - 2);
                            shape = "number-dropdown"; // not actually number
                        } else {
                            // reporter (or embedded!)
                            shape = "reporter";
                        }
                        break;

                    case "[":
                        if (/^#[A-Fa-f0-9]{3,6}$/.test(code)) {
                            // color
                            shape = "color";
                        } else {
                            // string
                            shape = "string";

                            // dropdown?
                            if (/ v$/i.test(code)) {
                                is_dropdown = true;
                                code = code.substr(0, code.length - 2);
                                shape = "dropdown";
                            }
                        }
                        break;

                    case "<":
                        // boolean
                        shape = "boolean";
                        category = "operators";
                        break;

                    default:
                        // should be stack
                        break;
                }
            }
        }

        // check for variables
        if (shape === "reporter") {
            if (pieces.length === 1 &&
                    !is_open_bracket(pieces[0][0])) {
                category = "variables"; // only used if we can't find_block
            } else { // check for embedded blocks
                shape = "embedded";
            }
        }

        // add shape class
        $block.addClass(shape);

        // empty blocks
        if (code.length === 0) {
            code = " "; // must have content to size correctly
            pieces = [code];
            $block.addClass("empty");
        }

        // render color inputs
        if (shape === "color") {
            $block.css({
                "background-color": code
            });
            $block.text(" ");
            return $block;
        }

        // RENDARRR //

        function is_block(piece) {
            return piece.length > 1 && (
                is_open_bracket(piece[0]) || is_close_bracket(piece[0])
            );
        }

        // filter out block text
        $.each(pieces, function (i, piece) {
            if (!is_block(piece)) {
                text += piece;
            }
        });

        // render the pieces
        var $arg_list = [];
        if (shape === "custom-definition") {
            // custom definition args
            $block.append("define");
            var $outline = $("<div>").addClass("outline");
            $block.append($outline);

            $.each(pieces, function (i, piece) {
                if (is_block(piece)) {
                    var $arg = $("<div>").addClass("custom-arg");
                    if (piece[0] === "<") {
                        $arg.addClass("boolean");
                    }
                    $arg.text(strip_brackets(piece));
                    $outline.append($arg);
                } else {
                    $outline.append(document.createTextNode(piece));
                }
            });
        } else if (pieces.length === 1) {
            if (code == " ") {
                $block.html("&nbsp;");
            } else {
                $block.text(code);
            }
        } else {
            $.each(pieces, function (i, piece) {
                var $arg;
                if (is_block(piece)) {
                    if (is_database) {
                        // DATABASE: avoid find_block
                        $arg = render_block(piece, "database");
                    } else {
                        $arg = render_block(piece);
                    }
                    $block.append($arg);
                    $arg_list.push($arg);
                } else {
                    $block.append(document.createTextNode(piece));
                }

                // DATABASE
                if (is_database) {
                    // tag list dropdowns
                    if (piece === "[list v]") {
                        $arg.addClass("list-dropdown");
                    }
                    // tag math function
                    if (piece === "[sqrt v]") {
                        $arg.addClass("math-function");
                    }
                }
            });
        }

        // get category
        if (shape === "custom-definition") {
            $block.addClass("custom");
        } else if ($.inArray(shape, DATA_INSERTS) > -1) {
            // don't add category to inserts
        } else {
            var arg_classes = [],
                info;

            // find block
            if (!is_database) {
                info = find_block(text, $arg_list);
                classes = info[0];
                arg_classes = info[1];
            }

            if (classes.length === 0) {
                // can't find the block!
                if (category !== "") {
                    $block.addClass(category);
                } else {
                    $block.addClass("obsolete");
                }
            } else {
                $.each(classes, function (i, name) {
                    if (!(/^-/.test(name))) {
                        $block.addClass(name);
                    }
                });

                if ($.inArray("hat", classes) > -1) {
                    $block.removeClass("stack");
                }

                $.each(arg_classes, function (i, name) {
                    var $arg = $arg_list[i];
                    if ($arg && name) {
                        if (name === "list-dropdown" &&
                                !$arg.hasClass("dropdown")) {
                            // HACK - only recognise lists if they're dropdowns
                        } else {
                            $arg.addClass(name);
                        }
                    }
                });
            }
        }


        // replace images

        function replace_text_with_image(regex, image_class) {
            var html = $block.html(),
                image = '<span class="' + image_class + '"></span>';
            html = html.replace(regex, image);
            $block.html(html);
        }

        // image: green flag
        if ($.inArray("-green-flag", classes) > -1) {
            replace_text_with_image(/green flag|flag|gf/i, "green-flag");
        }

        // image: turn cw/ccw arrows
        if ($.inArray("-turn-arrow", classes) > -1) {
            if (/ccw|left/i.test(text)) {
                replace_text_with_image(/ccw|left/i, "arrow-ccw");
            } else {
                replace_text_with_image(/cw|right/i, "arrow-cw");
            }
        }


        // cend blocks: hide "end" text
        if ($block.hasClass("cend")) {
            var html = $block.html();
            $block.html("").append($("<span>").html(html));
        }


        // put free-floating inserts inside a stack block
        if (need_shape === "stack" && $.inArray(shape, DATA_INSERTS) > -1) {
            var $insert = $block;
            $block = $("<div>").addClass("stack")
                               .addClass("obsolete")
                               .append($insert);
        }


        return $block;
    }

    /* Render comment to DOM element. */
    function render_comment(text) {
        var $comment = $("<div>").addClass("comment")
                .append($("<div>").text(text.trim()));
        return $comment;
    }

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

            // empty lines separate stacks
            if (line.trim() === "" && nesting === 0) {
                new_script();
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
                        $block.hasClass("custom-definition")) {

                    new_script();

                    // comment
                    if ($comment) {
                        $comment.addClass("to-hat");

                        if ($block.hasClass("custom-definition")) {
                            $comment.addClass("to-custom-definition");
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
                        if ($.inArray(category, CLASSES.category) > -1) {
                            $block.addClass(category);
                        }
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
            if ($first.hasClass("custom-definition")) {
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
            $.each(scripts, function (i, $script) {
                $container.append($script);
            });
        });
    };


    return sb2; // export the module
}(jQuery);



/* The list of blocks, in scratchblocks format.
 *
 * Added by compile_blocks.py. Loaded by dev.html during development.
 *
 * Special values:
 *  [list v] -- used to identify list dropdowns
 *  [sqrt v] -- identifies math function, in the ([sqrt v] of ()) block
 *
 */
scratchblocks2.blocks = "";
