/*
 * scratchblocks2
 * http://github.com/blob8108/scratchblocks2
 *
 * Copyright 2013, Tim Radvan
 * MIT Licensed
 * http://opensource.org/licenses/MIT
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


        // List of valid classes used in HTML
        CLASSES = {
            "misc": [
                "scratchblocks2-container",
                "script",
                "empty",
                "list-dropdown"
            ],
            "comments": [
                "comment",
                "attached",
                "to-hat",
                "to-reporter"
            ],
            "internal": [
                "math-function"
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
                "capend"
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
                "purple"  // The ([slider v] sensor value) and
                          // <sensor [button pressed v]?> blocks. I'm not sure
                          // what category this is supposed to be.
            ]
        },
        all_classes,

        // The list of blocks
        blocks_db,

        // Used to keep a copy of sb2.blocks, so we can detect changes
        blocks_original,

        // from: http://stackoverflow.com/questions/990904#answer-5912746
        diacritics_removal_map = [
            {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
            {'base':'AA','letters':/[\uA732]/g},
            {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
            {'base':'AO','letters':/[\uA734]/g},
            {'base':'AU','letters':/[\uA736]/g},
            {'base':'AV','letters':/[\uA738\uA73A]/g},
            {'base':'AY','letters':/[\uA73C]/g},
            {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
            {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
            {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
            {'base':'DZ','letters':/[\u01F1\u01C4]/g},
            {'base':'Dz','letters':/[\u01F2\u01C5]/g},
            {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
            {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
            {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
            {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
            {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
            {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
            {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
            {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
            {'base':'LJ','letters':/[\u01C7]/g},
            {'base':'Lj','letters':/[\u01C8]/g},
            {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
            {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
            {'base':'NJ','letters':/[\u01CA]/g},
            {'base':'Nj','letters':/[\u01CB]/g},
            {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
            {'base':'OI','letters':/[\u01A2]/g},
            {'base':'OO','letters':/[\uA74E]/g},
            {'base':'OU','letters':/[\u0222]/g},
            {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
            {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
            {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
            {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
            {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
            {'base':'TZ','letters':/[\uA728]/g},
            {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
            {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
            {'base':'VY','letters':/[\uA760]/g},
            {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
            {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
            {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
            {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
            {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
            {'base':'aa','letters':/[\uA733]/g},
            {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
            {'base':'ao','letters':/[\uA735]/g},
            {'base':'au','letters':/[\uA737]/g},
            {'base':'av','letters':/[\uA739\uA73B]/g},
            {'base':'ay','letters':/[\uA73D]/g},
            {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
            {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
            {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
            {'base':'dz','letters':/[\u01F3\u01C6]/g},
            {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
            {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
            {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
            {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
            {'base':'hv','letters':/[\u0195]/g},
            {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
            {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
            {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
            {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
            {'base':'lj','letters':/[\u01C9]/g},
            {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
            {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
            {'base':'nj','letters':/[\u01CC]/g},
            {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
            {'base':'oi','letters':/[\u01A3]/g},
            {'base':'ou','letters':/[\u0223]/g},
            {'base':'oo','letters':/[\uA74F]/g},
            {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
            {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
            {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
            {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
            {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
            {'base':'tz','letters':/[\uA729]/g},
            {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
            {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
            {'base':'vy','letters':/[\uA761]/g},
            {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
            {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
            {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
            {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
        ];



    function log(message) {
        if (window.console !== undefined) {
            window.console.log(message);
        }
    }


    function assert(bool) {
        if (!bool) {
            log("Assertion failed!");
            //debugger;
        }
    }


    /* is class name in class list? */
    function is_class(name) {
        if (all_classes === undefined) {
            all_classes = [];
            $.each(CLASSES, function (i, classes_group) {
                all_classes = all_classes.concat(classes_group);
            });
        }
        return ($.inArray(name, all_classes) > -1);
    }


    /* helper function for class name prefixes */
    function cls(name) {
        if (!is_class(name)) {
            log("Invalid class: " + name);
            //debugger;
        }
        return name;
    }

    /* Bracket helpers */
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
            } else if (chr !== " ") {
                return false; // something else => it's a bracket
            }
        }

        for (i = index - 1; i > -1; i--) {
            chr = code[i];
            if (is_close_bracket(chr)) {
                break; // must be an innocuous lt/gt!
            } else if (chr !== " ") {
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
            if ($block.hasClass(cls(category))) {
                block_category = category;
            }
        });
        return block_category;
    }


    /* Return the shape class for the given insert. */
    function get_arg_shape($arg) {
        if (!$arg) return "";
        var arg_shape;
        $.each(ARG_SHAPES, function (i, shape) {
            if ($arg.hasClass(cls(shape))) {
                arg_shape = shape;
            }
        });
        return arg_shape;
    }


    /* Strip block text, for looking up in blocks db. */
    function strip_block_text(text) {
        var map = diacritics_removal_map;
        text = text.replace(/[ ,%?:]/g, "").toLowerCase();
        for(var i=0; i<map.length; i++) {
            text = text.replace(map[i].letters, map[i].base);
        }
        return text;
    }


    /* Get text from $block DOM element. Make sure you clone the block first. */
    function get_block_text($block) {
        $block.children().remove();
        return strip_block_text($block.text());
    }


    /* Hex color #rrggb or #rgb to [r, g, b] */
    function hex2rgb(hexStr) {
        var hex, r, g, b;
        assert(hexStr[0] === "#");
        hexStr = hexStr.substring(1);
        if (hexStr.length === 3) {
            r = hexStr[0];
            g = hexStr[1];
            b = hexStr[2];
            hexStr = r + r + g + g + b + b;
        }
        hex = parseInt(hexStr, 16);
        if (hexStr.length === 6) {
            r = (hex & 0xff0000) >> 16;
            g = (hex & 0x00ff00) >> 8;
            b = hex & 0x0000ff;
        }
        return [r, g, b];
    }


    function clamp(x, a, b) {
        return Math.min(b, Math.max(x, a));
    }


    /* Multiply colour by scalar value. */
    function scale_color(rgb, scale) {
        var r = rgb[0],
            g = rgb[1],
            b = rgb[2];
        r = parseInt(clamp(r * scale, 0, 255));
        g = parseInt(clamp(g * scale, 0, 255));
        b = parseInt(clamp(b * scale, 0, 255));
        return [r, g, b];
    }


    function rgb2css(rgb) {
        var r = rgb[0],
            g = rgb[1],
            b = rgb[2];
        return "rgb(" + r + ", " + g + ", " + b + ") ";
    }

    /* Set hexColor as background color of $block */
    function apply_block_color($block, hexColor) {
        var rgb = hex2rgb(hexColor);
        var btop = rgb2css(scale_color(rgb, 1.4));
        var bbot = rgb2css(scale_color(rgb, 0.7));
        $block.css({
            "background-color": rgb2css(rgb),
            "border-top-color": btop,
            "border-left-color": btop,
            "border-bottom-color": bbot,
            "border-right-color": bbot
        });
    }


    /* Parse the blocks database. */
    function load_blocks_db() {
        var db = {},
            category = "";

        // newlines are escaped, so split at double-space instead
        $.each(sb2.blocks.split(/ {2}|\n|\r/), function (i, line) {
            line = line.trim();
            if (line.length === 0) {
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

        // keep a reference to the blocks definition, in case it changes.
        blocks_original = sb2.blocks;
    }


    /* Return the blocks database, loading it first if needed. */
    function get_blocks_db() {
        if (blocks_original === undefined ||
                blocks_original !== sb2.blocks) {
            // blocks code has changed, parse it again!
            load_blocks_db();
            log("Parsed blocks db.");
        }
        return blocks_db;
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
            block = poss_blocks[0];

            if (poss_blocks.length > 1) {
                // choose based on args
                $.each(poss_blocks, function (i, poss_block) {
                    var category = poss_block[0][0],
                        need_args = poss_block[1],
                        fits = true,
                        $arg,
                        arg_shape,
                        j;

                    for (j = 0; j < need_args.length; j++) {
                        $arg = $arg_list[j];
                        arg_shape = get_arg_shape($arg);

                        if (arg_shape !== need_args[j]) {
                            if (need_args[j] === "math-function") {
                                // check is valid math function
                                var func =  $arg.text().replace(/[ ]/g, "")
                                        .toLowerCase();
                                if ($.inArray(func, MATH_FUNCTIONS) === -1) {
                                    // can't find the argument!
                                    fits = false;
                                    break;
                                }

                            } else if (
                                // allow reporters in number/string inserts
                                !((arg_shape === "reporter" ||
                                   arg_shape === "embedded"
                                 ) && (
                                   need_args[j] === "number" ||
                                   need_args[j] === "string"
                                ))
                            ) {
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

        // HACK: scratch 1.4 "when ... clicked" block
        if (block === undefined) {
            if (/^when.*clicked$/.test(text)) {
                block = blocks["whenthisspriteclicked"][0];
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
        $block.addClass(cls(shape));

        // empty blocks
        if (code.length === 0) {
            code = " "; // must have content to size correctly
            pieces = [code];
            $block.addClass(cls("empty"));
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
            var $outline = $("<div>").addClass(cls("outline"));
            $block.append($outline);

            $.each(pieces, function (i, piece) {
                if (is_block(piece)) {
                    var $arg = $("<div>").addClass(cls("custom-arg"));
                    if (piece[0] === "<") {
                        $arg.addClass(cls("boolean"));
                    }
                    $arg.text(strip_brackets(piece));
                    $outline.append($arg);
                } else {
                    $outline.append(piece);
                }
            });
        } else if (pieces.length === 1) {
            $block.text(code);
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
                    $block.append(piece);
                }

                // DATABASE
                if (is_database) {
                    // tag list dropdowns
                    if (piece === "[list v]") {
                        $arg.addClass(cls("list-dropdown"));
                    }
                    // tag math function
                    if (piece === "[sqrt v]") {
                        $arg.addClass(cls("math-function"));
                    }
                }
            });
        }

        // get category
        if (shape === "custom-definition") {
            $block.addClass(cls("custom"));
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
                    $block.addClass(cls(category));
                } else {
                    $block.addClass(cls("obsolete"));
                }
            } else {
                $.each(classes, function (i, name) {
                    if (!(/^-/.test(name))) {
                        $block.addClass(cls(name));
                    }
                });

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
        if ($block.hasClass(cls("cend"))) {
            var html = $block.html();
            $block.html("").append($("<span>").html(html));
        }


        // put free-floating inserts inside a stack block
        if (need_shape === "stack" && $.inArray(shape, DATA_INSERTS) > -1) {
            var $insert = $block;
            $block = $("<div>").addClass(cls("stack"))
                               .addClass(cls("obsolete"))
                               .append($insert);
        }


        return $block;
    }


    /* Render comment to DOM element. */
    function render_comment(text) {
        var $comment = $("<div>").addClass(cls("comment"))
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
            assert($cwrap.hasClass(cls("cwrap")));

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
                $block.addClass(cls("capend"));
            }
        }

        function new_script() {
            // end any c blocks
            while (nesting > 0) {
                var $cend = $("<div><span>end</span></div>")
                        .addClass(cls("stack")).addClass(cls("cend"))
                        .addClass(cls("control"));
                add_cend($cend, false);
            }

            // push script
            if ($script !== undefined && $script.children().length > 0) {
                scripts.push($script);
            }

            // start new script
            $script = $("<div>").addClass(cls("script"));
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
                        $last_comment.children().text() + "\n"
                        + comment_text
                    );
                } else {
                    $comment = render_comment(comment_text);
                }
            }

            // append block to script
            if ($block) {
                one_only = false;
                if ($block.hasClass(cls("hat")) ||
                        $block.hasClass(cls("custom-definition"))) {

                    new_script();

                    // comment
                    if ($comment) {
                        $comment.addClass(cls("to-hat"));

                        if ($block.hasClass(cls("custom-definition"))) {
                            $comment.addClass(cls("to-custom-definition"));
                        }
                    }
                } else if ($block.hasClass(cls("boolean")) ||
                           $block.hasClass(cls("embedded")) ||
                           $block.hasClass(cls("reporter"))) {
                    new_script();
                    one_only = true;

                    // comment
                    if ($comment) {
                        $comment.addClass(cls("to-reporter"));
                    }
                }

                // comment
                if ($comment) {
                    $comment.addClass(cls("attached"));
                }

                if ($block.hasClass(cls("cstart"))) {
                    $cwrap = $("<div>").addClass(cls("cwrap"));
                    $current.append($cwrap);
                    $cwrap.append($block);

                    // comment
                    if ($comment) {
                        $cwrap.append($comment);
                        $comment = null; // don't start multi-line comment
                    }

                    $cmouth = $("<div>").addClass(cls("cmouth"));
                    $cwrap.append($cmouth);
                    $current = $cmouth;

                    // give $cwrap the color of $block
                    $cwrap.addClass(get_block_category($block));

                    if ($block.hasClass(cls("cap"))) {
                        $cwrap.addClass(cls("cap"));
                        $block.removeClass(cls("cap"));
                    }

                    nesting += 1;

                } else if ($block.hasClass(cls("celse"))) {
                    if (nesting > 0) {
                        $cwrap = $current.parent();
                        assert($cwrap.hasClass(cls("cwrap")));

                        $cwrap.append($block);

                        // comment
                        if ($comment) {
                            $cwrap.append($comment);
                            $comment = null; // don't start multi-line comment
                        }

                        $cmouth = $("<div>").addClass(cls("cmouth"));
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
                    $current.append($comment);
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
                    $variable.removeClass(cls("variables"))
                             .addClass(cls("custom-arg"));
                } else if ($.inArray(var_name, list_names) > -1) {
                    $variable.removeClass(cls("variables"))
                             .addClass(cls("list"));
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
                    $block.removeClass(cls("obsolete"))
                          .addClass(cls("custom"));
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
    sb2.parse = function (selector) {
        var selector = selector || "pre.blocks";

        // find elements
        $(selector).each(function (i, el) {
            var $el = $(el),
                code = $el.text(),
                scripts = render(code);

            $el.text("");
            $el.addClass(cls("scratchblocks2-container"));
            $.each(scripts, function (i, $script) {
                $el.append($script);
            });
        });
    }

    return sb2; // export the module
}(jQuery);



/* The list of blocks, in scratchblocks format.
 *
 * Special values:
 *  [list v] -- used to identify list dropdowns
 *  [sqrt v] -- identifies math function, in the ([sqrt v] of ()) block
 *
 */
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
## Stage-specific   \
## Looks ##   \
switch backdrop to [backdrop1 v] and wait   \
next backdrop   \
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
delete this clone ## cap   \
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
\
(video [motion v] on [this sprite v])   \
turn video [on v]   \
set video transparency to (50)%   \
\
(timer)   \
reset timer   \
\
([x position v] of [Sprite1 v])   \
\
(current [minute v])   \
(days since 2000)   \
(username)   \
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
\
\
\
## Purple ##   \
when [button pressed v] ## hat   \
<sensor [button pressed v]?>   \
([slider v] sensor value)   \
\
turn motor on for (1) secs   \
turn motor on   \
turn motor off   \
set motor power (100)   \
set motor direction [this way v]   \
\
when distance < (20) ## hat   \
when tilt = (1) ## hat   \
(distance)   \
(tilt)   \
\
\
\
" +
// Obsolete Scratch 1.4 blocks //
"\
## Looks ##   \
switch to costume [costume1 v]   \
\
switch to background [background1 v]   \
next background   \
(background #)   \
\
\
\
## Control ##   \
if <> ## cstart   \
forever if <> ## cstart cap  \
stop script ## cap   \
stop all ## cap   \
\
\
\
## Events ##   \
when clicked ## hat   \
\
\
\
## Sensing ##   \
<loud?>   \
\
\
\
## Purple ##   \
motor on   \
motor off   \
motor on for (1) seconds   \
motor power (100)   \
motor direction [this way v]   \
\
\
\
" +
/*
 * lang pt_BR
 *
 * Lista de blocos no formato scratchblocks.
 *
 * Valores especiais:
 *  [list v] -- usado para identificar listas
 *  [sqrt v] -- usado para identificar funções matemáticas no bloco([sqrt v] of ())
 *
 */
"\
## Motion ##   \
mova (10) passos   \
vire cw (15) graus ## -turn-arrow   \
vire right (15) graus ## -turn-arrow   \
vire ccw (15) graus ## -turn-arrow   \
vire left (15) graus ## -turn-arrow   \
\
aponte para a direção (90 v)   \
aponte para [ v]   \
\
vá para x: (0) y: (0)   \
vá para [mouse-pointer v]   \
deslize em (1) segundos para x: (0) y: (0)   \
\
mude x por (10)   \
mude x para (0)   \
mude y por (10)   \
soma (10) a y   \
soma (10) a x   \
mude y para (0)   \
\
se tocar na borda, volta   \
\
mude o estilo de rotação para [left-right v]   \
\
(posição x)   \
(posição y)   \
(direção)   \
\
\
\
## Looks ##   \
diga [Hello!] por (2) segundos   \
diga [Hello!]   \
pense [Hmm...] por (2) segundos   \
pense [Hmm...]   \
\
apareça   \
desapareça   \
\
mude para o traje [costume1 v]   \
próximo traje   \
mude para o fundo de tela [backdrop1 v]   \
\
soma ao efeito [color v] (25)   \
\
mude o efeito [color v] para (0)   \
mude o efeito [color v] por (0)   \
apague os efeitos gráficos   \
limpe os efeitos gráficos   \
\
some (10) ao tamanho   \
mude o tamanho para(100)%   \
mude o tamanho por(10)   \
\
vá para a camada de cima   \
\
desça (1) camadas   \
\
(traje #)   \
(traje n°)   \
(nome do fundo de tela)   \
(tamanho)   \
\
## Stage-specific   \
## Looks ##   \
mude para o fundo de tela [backdrop1 v] e espere   \
próximo fundo de tela   \
\
(fundo de tela #)   \
(fundo de tela n°)   \
\
\
\
## Sound ##   \
toque o som [pop v]   \
toque o som [pop v] até terminar   \
pare todos os sons   \
\
toque o tambor (1 v) por (0.2) batidas   \
silencio por (0.2) batidas   \
pare por (0.2) batidas   \
\
toque a nota (60 v) por (0.5) batidas   \
use o instrumento (1 v)   \
mude o instrumento para (1 v)   \
\
soma (-10) ao volume   \
mude o volume por (-10)    \
mude o volume para (100)%   \
(volume)   \
\
soma (20) ao ritmo   \
mude o ritmo por (20)   \
mude o ritmo para (60) bpm   \
(ritmo)   \
\
\
\
## Pen ##   \
limpe   \
apague tudo   \
\
carimbe   \
\
abaixe a caneta   \
levante a caneta   \
\
mude a cor da caneta para [#f0f]   \
mude a cor da caneta por (10)   \
soma (10) à cor da caneta   \
mude a cor da caneta para (0)   \
\
soma (10) ao tom da caneta    \
soma (10) à intensidade da caneta    \
mude a intensidade da caneta para (50)   \
mude o tom da caneta para (50)   \
\
soma (1) ao tamanho da caneta   \
mude o tamanho da caneta para (1)   \
mude o tamanho da caneta por (1)   \
\
\
\
## Variables ##   \
mude [var v] para [0]   \
mude [var v] por(1)   \
soma a [var v] (1)   \
mostra variável [var v]   \
esconde variável [var v]   \
\
\
\
## List ##   \
adiciona [thing] a [list v]   \
\
apaga (1 v) de[list v]   \
insere [thing] na posição (1 v) da lista [list v]   \
insere [thing] em (1 v) de [list v]   \
substitui o item (1 v) da lista [list v] por [thing]   \
substitui (1 v) de [list v] com [thing]   \
(item (1 v) de [list v])   \
(tamanho de [list v])   \
<[list v] contém [thing]>   \
\
mostra lista [list v]   \
esconde lista [list v]   \
\
\
\
## Events ##   \
quando gf clicada ## hat -green-flag   \
\
quando clicar em gf## hat -green-flag   \
quando a tecla [space v] for pressionada## hat   \
quando este objeto for clicado ## hat   \
quando o fundo de tela mudar para [backdrop1 v] ## hat   \
\
quando [loudness v] > (10) ## hat   \
\
quando eu ouvir [message1 v] ## hat    \
anuncie [message1 v] para todos   \
anuncie [message1 v] para todos e espere   \
\
\
\
## Control ##   \
espere (1) segundos   \
\
repita (10) vezes ## cstart   \
repita (10) ## cstart   \
sempre ## cstart cap   \
se <> então## ifblock cstart   \
senão## celse   \
fim## cend   \
espere até que <>   \
espere até <>   \
repita até < > ## cstart   \
repita até que <> ## cstart   \
\
pare [all v] ## cap   \
\
quando eu começar como clone ## hat   \
cria clone de [myself v]   \
apaga este clone ## cap   \
\
\
\
## Sensing ##   \
<tocando em [ v]?>   \
<tocando na cor [#f0f]?>   \
<a cor [#f0f] está tocando na cor [#f0f]?>   \
(distância até [ v])   \
\
pergunte %s e espere a resposta   \
pergunte %s e espere   \
(resposta)   \
\
<tecla [space v] pressionada?>   \
<mouse pressionado?>   \
(mouse x)   \
(mouse y)   \
\
(volume do som)   \
\
([motion v] do vídeo em [this sprite v])   \
vídeo [on v]   \
muda a transparência do vídeo para (50)%   \
\
(cronômetro)   \
(temporizador)   \
zere cronômetro   \
zere o temporizador   \
\
([posição x v] de [Sprite1 v])   \
\
([minute v] atual)   \
(dias desde 20000)   \
(nome de usuário)   \
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
(sorteie número entre (1) e (10))   \
\
<[] < []>   \
<[] = []>   \
<[] > []>   \
\
<<> e <>>   \
<<> ou <>>   \
<não <>>   \
\
(junte [hello ] [world])   \
(letra (1) de [world])   \
(letras em [world])   \
\
\
(resto da divisão de () por ())   \
(() resto da divisão por ())   \
(resto de() por())   \
(arredonde ())   \
\
([raiz quadrada v] of (9))   \
\
\
\
## Purple ##   \
quando [button pressed v] ## hat   \
<sensor [button pressed v]?>   \
<sensor [button pressed v] ativado?>   \
(valor do sensor [slider v])   \
\
ligue o motor por (1) segundos   \
ligue o motor   \
desligue o motor   \
mude a potência do motor para (100)   \
use a direção do motor [this way v]   \
\
quando a distância for < (20) ## hat   \
quando a inclinação for= (1) ## hat   \
(distância)   \
(inclinação)   \
\
\
\
// Obsolete Scratch 1.4 blocks //   \
\
## Looks ##   \
mude para o traje [costume1 v]   \
\
mude para o fundo de tela [background1 v]   \
próximo fundo de tela   \
(fundo de tela #)   \
\
\
\
## Control ##   \
se <> ## cstart   \
sempre se <> ## cstart cap    \
pare comando ## cap   \
pare tudo ## cap   \
\
\
\
## Events ##   \
quando clicado ## hat   \
\
\
\
## Sensing ##   \
<som alto?>   \
\
\
\
## Purple ##   \
motor ligado   \
motor desligado   \
motor ligado por (1) segundos   \
potência do motor(100)   \
direção do motor [this way v]   \
\
\
\
";
