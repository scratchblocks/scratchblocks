/* scratchblocks2.js

Copyright © 2012 Tim Radvan

*/

var scratchblocks2 = {};


if (!Array.prototype.indexOf) {
   Array.prototype.indexOf = function(item) {
      var i = this.length;
      while (i--) {
         if (this[i] === item) return i;
      }
      return -1;
   }
}


scratchblocks2._assert = function (bool) {
    if (!bool) {
        console.log("Assertion failed!");
        debugger;
    }
};


/* helper function for class name prefixes */
scratchblocks2._cls = function (name) {
    var assert = scratchblocks2._assert;
    var is_class = scratchblocks2._is_class;
    assert(is_class(name));
    return name; //return "-scratchblocks2-" + name;
};



scratchblocks2._classes = {
    "misc": [
        "container",
        "script",
        "empty",

        "list-dropdown",
    ],
    "shape": [
        "hat",
        "cap",
        "stack",
        "embedded",
        "reporter",
        "boolean",
        "string",
        "dropdown",
        "number",
        "number-dropdown",
        "color",
        "custom-definition",
        "custom-arg",
        "outline",

        "cstart",
        "cmouth",
        "cwrap",
        "celse",
        "cend",
        "ifblock",
    ],
    "category": [
        "obsolete",

        "control",
        "custom",
        "events",
        "list",
        "looks",
        "motion",
        "operators",
        "pen",
        "sensing",
        "sound",
        "variables",
        "purple", // The ([slider v] sensor value) and 
                  // <sensor [button pressed v]?> blocks. I'm not sure what
                  // category this is supposed to be.
    ]
};

scratchblocks2._is_class = function (name) {
    var classes = scratchblocks2._classes;
    if (scratchblocks2._all_classes == undefined) {
        var all = [];
        for (clstype in classes) {
            all = all.concat(classes[clstype]);
        }
        scratchblocks2._all_classes = all;
    }
    return (scratchblocks2._all_classes.indexOf(name) > -1);
}


/* Render all matching elements in page to shiny scratch blocks.
 * Accepts a CSS-style selector as an argument, or a dictionary with tag/class
 * values. Examples:
 *
 *  scratchblocks2.parse("pre.blocks");
 *
 *  scratchblocks2.parse({
 *      containerTag: "pre",
 *      containerClass: "blocks",
 *  });
 */
scratchblocks2.parse = function (d) {
    var selector = "";
    var cls = scratchblocks2._cls;

    if ($.type(d) == "string") {
        selector = d;
    } else {
        // support same args as JSO's scratchBlocksPlugin
        if ("containerTag" in d)   selector += d["containerTag"];
        if ("containerClass" in d) selector += "."+d["containerClass"];
    }

    // find elements
    $(selector).each(function (i, el) {
        var $el = $(el);

        var code = $el.text();
        var scripts = scratchblocks2._render(code);

        $el.html("");
        $el.addClass(cls("container"));
        $.each(scripts, function (i, $script) {
            $el.append($script);
        });
    });
};


/* Render script code to a list of DOM elements, one for each script. */
scratchblocks2._render = function (code) {
    var cls = scratchblocks2._cls;
    var assert = scratchblocks2._assert;
    var get_block_category = scratchblocks2._get_block_category;

    var scripts = [];
    var $script;
    var $current;
    var nesting;

    var new_script = function() {
        if ($script != undefined && $script.children().length > 0) {
            scripts.push($script);
        }
        $script = $("<div>").addClass(cls("script"));
        $current = $script;
        nesting = 0;
    };
    new_script();

    var lines = code.split(/\n/);
    for (var i=0; i<lines.length; i++) {
        var line = lines[i];

        // TODO: comments
        // ignore them for now
        if (/^\/\//.test(line.trim())) {
            continue;
        }
        
        // empty lines separate stacks
        if (line.trim() == "") {
            new_script();
            continue;
        }

        $block = scratchblocks2._render_block(line, "stack");
        
        if ($block) {
            var one_only = false;
            if ( $block.hasClass(cls("hat")) ||
                 $block.hasClass(cls("custom-definition")) ) {
                new_script();
            } else if ($block.hasClass(cls("boolean")) ||
                       $block.hasClass(cls("embedded")) ||
                       $block.hasClass(cls("reporter"))) {
                new_script();
                one_only = true;
            }
            
            if ($block.hasClass(cls("cstart"))) {
                var $cwrap = $("<div>").addClass(cls("cwrap"));
                $current.append($cwrap);
                $cwrap.append($block);
                
                var $cmouth = $("<div>").addClass(cls("cmouth"));
                $cwrap.append($cmouth);
                $current = $cmouth;

                // give $cwrap the color of $block
                $cwrap.addClass(get_block_category($block));

                if ($block.hasClass(cls("cap"))) {
                    $cwrap.addClass(cls("cap"));
                }

                nesting += 1;

            } else if ($block.hasClass(cls("celse"))) {
                if (nesting > 0) {
                    var $cwrap = $current.parent();
                    assert($cwrap.hasClass(cls("cwrap")));

                    $cwrap.append($block);

                    var $cmouth = $("<div>").addClass(cls("cmouth"));
                    $cwrap.append($cmouth);
                    $current = $cmouth;
                    
                    // give $block the color of $cwrap
                    $block.removeClass(get_block_category($block));
                    $block.addClass(get_block_category($cwrap));
                } else {
                    $current.append($block);
                }

            } else if ($block.hasClass(cls("cend"))) {
                if (nesting > 0) {
                    var $cwrap = $current.parent();
                    assert($cwrap.hasClass(cls("cwrap")));
                    
                    $cwrap.append($block);
                    $current = $cwrap.parent();
                    nesting -= 1;

                    // give $block the color of $cwrap
                    $block.removeClass(get_block_category($block));
                    $block.addClass(get_block_category($cwrap));
                } else {
                    $current.append($block);
                }
            } else {
                $current.append($block);
            }

            if (one_only) {
                new_script();
            }
        }
    }

    // push last script
    new_script();

    // HACK: list reporters
    var lists = [];
    for (var i=0; i<scripts.length; i++) {
        var $script = scripts[i];
        $script.find(".list-dropdown").each(function (i, list) {
            var name = $(list).text();
            lists.push(name);
        });
    }
    for (var i=0; i<scripts.length; i++) {
        var $script = scripts[i];
        $script.find(".variables.reporter").each(function (i, variable) {
            var $variable = $(variable);
            var name = $variable.text();
            if (lists.indexOf(name) > -1) {
                $variable.removeClass("variables").addClass("list");
            }
        });
    }

/*    // make .before and .after
    var lists = [];
    for (var i=0; i<scripts.length; i++) {
        var $script = scripts[i];
        $script.find(".stack, .cap").prepend("<div class=before>");
        $script.find(".stack, .hat, .custom-definition").append("<div class=after>");
    }*/

    return scripts;
};


/* Render script code to DOM. */
scratchblocks2._render_block = function (code, kind) {
    var cls = scratchblocks2._cls;
    var get_arg_shape = scratchblocks2._get_arg_shape;

    if (code.trim().length == 0 && kind == 'stack') {
        return;
    }

    // bracket helpers
    var BRACKETS = "([<)]>";
    var is_open_bracket = function (chr) {
        var bracket_index = BRACKETS.indexOf(chr);
        return (-1 < bracket_index && bracket_index < 3);
    };
    var is_close_bracket = function (chr) {
        return (2 < BRACKETS.indexOf(chr));
    };
    var get_matching_bracket = function (chr) {
        return BRACKETS[BRACKETS.indexOf(chr) + 3];
    };
    var is_lt_gt = function (code, index) {
        var chr = code[index];
        if (chr != "<" && chr != ">") {
            return false;
        }
        if (index == code.length) return;
        if (index == 0) return;
        for (var i=index+1; i<code.length; i++) {
            var chr = code[i];
            if (chr == " ") {
                // continue on...
            } else if (is_open_bracket(chr)) {
                // hold on a sec. this guy might be an innocuous lt/gt, and not
                // the bracket we suspected!
                break;
            } else {
                // nope, he's a bracket
                return false;
            }
        }
        for (var i=index-1; i>-1; i--) {
            var chr = code[i];
            if (chr == " ") {

            } else if (is_close_bracket(chr)) {
                break;
            } else {
                return false;
            }
        }
        
        // we got this far: he's okay! rescue him from bracketedness.
        return true;
    };
    var strip_brackets = function (code) {
        if (is_open_bracket(code[0])) {
            var bracket = code[0]; 
            if (code[code.length - 1] == get_matching_bracket(bracket)) {
                code = code.substr(0, code.length - 1);
            }
            code = code.substr(1);
        }
        return code;
    }

    // init vars
    if (kind == "database") {
        var is_database = true;
        kind = "";
    }
    if (kind == undefined) kind = "";
    var category = "";
    var bracket = "";
    
    // trim
    code = code.trim();

    // strip brackets
    var is_dropdown = false;
    if (is_open_bracket(code[0])) {
        bracket = code[0];
        code = strip_brackets(code);
    }

    // trim again
    if (bracket != "[") {
        code = code.trim();
    }

    // check kind
    if (bracket == "(" && /^(-?[0-9.]+( v)?)?$/.test(code)) {
        kind = "number";
    } else if (bracket == "[") {
        kind = "string";

        if (/#[A-Fa-f0-9]+/.test(code))  {
            kind = "color";
        }
    }

    // dropdowns for [string v] and number (123 v)
    if (kind == "number" || kind == "string") {
        if (/ v$/.test(code)) {
            is_dropdown = true;
            code = code.substr(0, code.length - 2);
            if (kind == "string") {
                kind = "dropdown";
            } else {
                kind = "number-dropdown";
            }
        }
    }
    
    // custom block definitions
    if (/^define/.test(code.trim())) {
        kind = "custom-definition"; 
        code = code.substr(6).trim();
    }

    // MAKE dom element
    if (kind == "stack" || kind == "hat" || kind == "custom-definition") {
        var $block = $("<div>");
    } else {
        var $block = $("<span>");
    }
    
    // give special classes colour
    if (kind == "custom-definition") {
        $block.addClass(cls("custom"));
    }

    
    // SPLIT into pieces
    var pieces = [];
    if (kind && kind != "stack" && kind != "custom-definition") {
        pieces = [code]; // don't bother splitting
    } else {
        code = code.trim();

        var piece = "";
        var piece_bracket = "";
        var matching_bracket = "";
        var nesting = 0;

        for (var i=0; i<code.length; i++) {
            var chr = code[i];
            if (nesting > 0) {
                piece += chr;
                if (chr == piece_bracket && !is_lt_gt(code, i)) {
                    nesting += 1;
                } else if (chr == matching_bracket && !is_lt_gt(code, i)) {
                    nesting -= 1;
                    if (nesting == 0) {
                        pieces.push(piece);
                        piece = "";
                    }
                }
            } else {
                if (is_open_bracket(chr) && !is_lt_gt(code, i)) {

                    piece_bracket = chr;
                    matching_bracket = get_matching_bracket(chr)
                    nesting += 1;
                    if (piece) pieces.push(piece);
                    piece = "";
                }
                piece += chr;
            }
        }
        if (piece) pieces.push(piece);

        // check for variables
        if (bracket == "(" && pieces.length == 1 && !is_open_bracket(pieces[0][0])) {
            kind = "reporter";
            var category = "variables";
        }
    }

    // check for embedded blocks
    if (bracket == "<") {
        kind = "boolean";
        var category = "operators";
    } else if (kind == "") {
        kind = "embedded";
    }

    if (kind == "stack" && bracket == "(") {
        kind = "embedded";
    }

    // add shape class
    $block.addClass(cls(kind));
    
    // empty blocks must have content to size correctly
    if (code.length == 0) {
        code = " ";
        pieces = [code];
        $block.addClass(cls("empty"));
    } 
    
    // render color inputs
    if (kind == "color") {
        $block.css({
            "background-color": code,
        });
        $block.html(" ");
        return $block;
    }
    
    // RENDARRR //
    var is_block = function (piece) {
        return piece.length > 1 && (
            is_open_bracket(piece[0]) || is_close_bracket(piece[0]));
    };

    // filter out block text
    var text = "";
    var args = [];
    for (var i=0; i<pieces.length; i++) {
        var piece = pieces[i];
        if (!is_block(piece)) {
            text += piece;
        }
    }

    // render the pieces
    var $arg_list = [];
    if (pieces.length == 1) {
        $block.html(code);
    } else if (kind == "custom-definition") { // custom block args
        $block.append("define");
        var $outline = $("<span>").addClass(cls("outline"));
        $block.append($outline);

        for (var i=0; i<pieces.length; i++) {
            var piece = pieces[i];
            if (is_block(piece)) {
                var $arg = $("<span>").addClass(cls("custom-arg"));
                if (piece[0] == "<") {
                    $arg.addClass(cls("boolean"));
                }
                $arg.html(strip_brackets(piece));
                $outline.append($arg);
            } else {
                $outline.append(piece);
            }
        }
    } else {
        for (var i=0; i<pieces.length; i++) {
            var piece = pieces[i];
            if (is_block(piece)) {
                var $arg = scratchblocks2._render_block(piece,
                        is_database ? "database" : ""); // DATABASE: avoid find_block
                $block.append($arg);
                args.push(get_arg_shape($arg));
                $arg_list.push($arg);
            } else {
                $block.append(piece);
            }

            // DATABASE: tag list dropdowns
            if (is_database && piece == "[list v]") {
                $arg.addClass("list-dropdown");
            }
        }
    }

    // get category
    if (kind != "custom-definition") {
        // TODO custom blocks
        var classes = [];
        var arg_classes = [];

        if (is_database) {
            // DATABASE: don't try to find_block!
        } else {
            var info = scratchblocks2._find_block(text, args);
            classes = info[0];
            arg_classes = info[1];
        }

        if (classes.length == 0) {
            // can't find the block!
            if (category != "") {
                $block.addClass(cls(category));
            } else {
                if (kind == "stack") {
                    $block.addClass(cls("custom"));
                } else if (kind == "embedded" && !$block.hasClass(cls("empty"))) {
                    $block.addClass(cls("obsolete"));
                }
            }
        } else {
            $.each(classes, function (i, name) {
                if (!(/^-/.test(name))) {
                    $block.addClass(cls(name));
                }
            });

            $.each(arg_classes, function (i, name) {
                var $arg = $arg_list[i];
                if ($arg && name) $arg.addClass(name);
            });
        }
        
        // image: green flag
        if (classes.indexOf("-green-flag") > -1) {
            var html = $block.html();
            var image = '<span class="green-flag"></span>';
            if (/green flag/.test(html)) {
                html = html.replace("green flag", image);
            } else {
                html = html.replace("flag", image);
                html = html.replace("gf", image);
            }
            $block.html(html);
        }

        // image: turn cw/ccw arrows
        if (classes.indexOf("-turn-arrow") > -1) {
            var html = $block.html();
            if (/ccw|left/.test(html)) {
                var image = '<span class="arrow-cw"></span>';
                html = html.replace("ccw", image);
                html = html.replace("left", image);
            } else {
                var image = '<span class="arrow-ccw"></span>';
                html = html.replace("cw", image);
                html = html.replace("right", image);
            }
            $block.html(html);
        }
    }
    
    // cend blocks: hide "end" text
    if ($block.hasClass(cls("cend"))) {
        var content = $block.html();
        $block.html("").append($("<span>").html(content))
    }

    return $block;
};


/* Return the category class for the given block. */
scratchblocks2._get_block_category = function ($block) {
    var cls = scratchblocks2._cls;
    var classes = scratchblocks2._classes;
    var block_category;
    $.each(classes.category, function (i, category) {
        if ($block.hasClass(cls(category))) {
            block_category = category;
        }
    });
    return block_category;
};


/* Return the shape class for the given insert. */
scratchblocks2._get_arg_shape = function ($arg) {
    var cls = scratchblocks2._cls;
    var SHAPES = ["reporter", "boolean", "string", "dropdown",
                  "number", "number-dropdown", "list-dropdown"];
    var arg_shape;
    $.each(SHAPES, function (i, shape) {
        if ($arg.hasClass(cls(shape))) {
            arg_shape = shape;
        }
    });
    return arg_shape;
};


/* Strip block text, for looking up in blocks db. */
scratchblocks2._strip_block_text = function (text) {
    return text.replace(/[ ,%?:]/g, "").toLowerCase();
};


/* Return [classes, arg_shapes] for a block, given its text. Uses args as hints. */
scratchblocks2._find_block = function (text, args) {
    var strip_block_text = scratchblocks2._strip_block_text;
    var blocks = scratchblocks2._get_blocks_db();

    // strip block text
    text = strip_block_text(text);
    
    // get block for text
    var block;
    if (text in blocks) {
        var poss_blocks = blocks[text];

        block = poss_blocks[0];

        if (poss_blocks.length > 1) {
            // choose based on args
            $.each(poss_blocks, function (i, poss_block) {
                var category = poss_block[0][0];
                var need_args = poss_block[1];
                var fits = true;

                for (var i=0; i<need_args.length; i++) {
                    if (args[i] != need_args[i]) {
                        if (args[i] == "reporter" && (
                                need_args[i] == "number" ||
                                need_args[i] == "string" )) {
                            // allow reporters in number/string inserts
                        } else {
                            fits = false;
                            break;
                        }
                    }
                }

                if (fits) {
                    block = poss_block;
                }
            });
        }
    }
   
    var classes = [];
    var arg_classes = [];
    if (block) {
        classes = block[0];

        // tag list dropdowns
        $.each(block[1], function (i, shape) {
            if (shape == "list-dropdown") {
                arg_classes.push(shape);
            } else {
                arg_classes.push("");
            }
        });
    }

    return [classes, arg_classes];
};


/* Return the blocks database, loading it first if needed. */
scratchblocks2._get_blocks_db = function () {
    if ( scratchblocks2._blocks_original === undefined ||
         scratchblocks2._blocks_original !== scratchblocks2.blocks) {
        // blocks code has changed, parse it again!
        scratchblocks2._load_blocks_db();
        console.log("Parsed blocks db.");
    }
    return scratchblocks2._blocks_db;
};


/* Parse the blocks database. */
scratchblocks2._load_blocks_db = function () {
    var strip_block_text = scratchblocks2._strip_block_text;
    var cls = scratchblocks2._cls;
    var get_arg_shape = scratchblocks2._get_arg_shape;

    var db = {};
    var category = "";

    var lines = scratchblocks2.blocks.split(/  /);
    for (var i=0; i<lines.length; i++) {
        var line = lines[i];
        line = line.trim();

        if (line.length == 0) continue;

        var classes = [category];

        // get category comment
        var commentIndex = line.indexOf("##");
        if (commentIndex == 0) {
            category = line.replace(/##/g, "").trim().toLowerCase();
            continue;
        } else if (commentIndex > 0) {
            var extra = line.substr(commentIndex+2).trim();
            line = line.substr(0, commentIndex);
            line = line.trim();
            classes = classes.concat(extra.split(" "));
        }

        // parse block
        var $block = scratchblocks2._render_block(line, "database");

        // get arg shapes
        var arg_shapes = [];
        $block.children().each(function (i, arg) {
            arg_shapes.push(get_arg_shape($(arg)));
        });
        
        // get text
        $block.children().remove();
        var text = $block.text();
        text = strip_block_text(text);

        // add block
        if (!(text in db)) db[text] = [];
        var block = [classes, arg_shapes];
        db[text].push(block);
    }
    
    scratchblocks2._blocks_db = db;

    // keep a reference to the blocks code, in case it changes.
    scratchblocks2._blocks_original = scratchblocks2.blocks;
};


/* The list of blocks, in scratchblocks format. */
scratchblocks2.blocks = "\
## Motion ##   \
move (10) steps   \
turn cw (15) degrees ## -turn-arrow   \
turn right (15) degrees ## -turn-arrow   \
turn ccw (15) degrees ## -turn-arrow   \
turn left (15) degrees ## -turn-arrow   \
\
point in direction (90 v)   \
point towards [ v]   \
\
go to x: (0) y: (0)   \
go to [mouse-pointer v]   \
glide (1) secs to x: (0) y: (0)   \
\
change x by (10)   \
set x to (0)   \
change y by (10)   \
set y to (0)   \
\
if on edge, bounce   \
\
set rotation style [left-right v]   \
\
(x position)   \
(y position)   \
(direction)   \
\
\
\
## Looks ##   \
say [Hello!] for (2) secs   \
say [Hello!]   \
think [Hmm...] for (2) secs   \
think [Hmm...]   \
\
show   \
hide   \
\
switch costume to [costume1 v]   \
next costume   \
switch backdrop to [backdrop1 v]   \
\
change [color v] effect by (25)   \
set [color v] effect to (0)   \
clear graphic effects   \
\
change size by (10)   \
set size to (100)%   \
\
go to front   \
go back (1) layers   \
\
(costume #)   \
(backdrop name)   \
(size)   \
\
# Stage-specific   \
switch background to [backdrop1 v] and wait   \
next backdrop   \
\
turn video [off v]   \
set video transparency to (50)%   \
\
(backdrop #)   \
\
\
\
## Sound ##   \
play sound [pop v]   \
play sound [pop v] until done   \
stop all sounds   \
\
play drum (1 v) for (0.2) beats   \
rest for (0.2) beats   \
\
play note (60 v) for (0.5) beats   \
set instrument to (1 v)   \
\
change volume by (-10)   \
set volume to (100)%   \
(volume)   \
\
change tempo by (20)   \
set tempo to (60) bpm   \
(tempo)   \
\
\
\
## Pen ##   \
clear   \
\
stamp   \
\
pen down   \
pen up   \
\
set pen color to [#f0f]   \
change pen color by (10)   \
set pen color to (0)   \
\
change pen shade by (10)   \
set pen shade to (50)   \
\
change pen size by (1)   \
set pen size to (1)   \
\
\
\
## Variables ##   \
set [var v] to [0]   \
change [var v] by (1)   \
show variable [var v]   \
hide variable [var v]   \
\
\
\
## List ##   \
add [thing] to [list v]   \
\
delete (1 v) of [list v]   \
insert [thing] at (1 v) of [list v]   \
replace item (1 v) of [list v] with [thing]   \
\
(item (1 v) of [list v])   \
(length of [list v])   \
<[list v] contains [thing]>   \
\
show list [list v]   \
hide list [list v]   \
\
\
\
## Events ##   \
when gf clicked ## hat -green-flag   \
when green flag clicked ## hat -green-flag   \
when flag clicked ## hat -green-flag   \
when [space v] key pressed ## hat   \
when this sprite clicked ## hat   \
when backdrop switches to [backdrop1 v] ## hat   \
\
when [loudness v] > (10) ## hat   \
\
when I receive [message1 v] ## hat   \
broadcast [message1 v]   \
broadcast [message1 v] and wait   \
\
\
\
## Control ##   \
wait (1) secs   \
\
repeat (10) ## cstart   \
forever ## cstart cap   \
if <> then ## ifblock cstart   \
else ## celse   \
end ## cend   \
wait until <>   \
repeat until <> ## cstart  \
\
stop [all v] ## cap   \
\
when I start as a clone ## hat   \
create clone of [myself v]   \
delete this clone   \
\
\
\
## Sensing ##   \
<touching [ v]?>   \
<touching color [#f0f]?>   \
<color [#f0f] is touching?>   \
(distance to [ v])   \
\
ask [What's your name?] and wait   \
(answer)   \
\
<key [space v] pressed?>   \
<mouse down?>   \
(mouse x)   \
(mouse y)   \
\
(loudness)   \
(video [motion v] on [this sprite v])   \
\
(timer)   \
reset timer   \
\
([x position v] of [Sprite1 v]   \
\
(current [minute v])   \
(days since 2000)   \
(user id)   \
\
\
\
## Operators ##   \
(() + ())   \
(() - ())   \
(() * ())   \
(() / ())   \
\
(pick random (1) to (10))   \
\
<[] < []>   \
<[] = []>   \
<[] > []>   \
\
<<> and <>>   \
<<> or <>>   \
<not <>>   \
\
(join [hello ] [world])   \
(letter (1) of [world])   \
(length of [world])   \
\
(() mod ())   \
(round ())   \
\
([sqrt v] of (9))   \
" +




// Obsolete Scratch 1.4 blocks //
"\
## Obsolete ##   \
if <> ## cstart   \
forever if <> ## cstart cap  \
<loud?>   \
\
\
\
## Purple ##   \
([slider v] sensor value)   \
<sensor [button pressed v]?>   \
";
