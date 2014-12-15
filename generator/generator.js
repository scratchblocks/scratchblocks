/*
 * scratchblocks2 generator
 * http://blob8108.github.io/scratchblocks2/generator/
 *
 * Copyright 2013, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 */

var SET_VAR = "setVar:to:";
var CHANGE_VAR = "changeVar:by:";

// `commands:Array` from Scratch SWF source
var BLOCKS = [
 ["move %n steps", " ", 1, "forward:", 10],
 ["turn @turnRight %n degrees", " ", 1, "turnRight:", 15],
 ["turn @turnLeft %n degrees", " ", 1, "turnLeft:", 15],
 ["--"],
 ["point in direction %d.direction", " ", 1, "heading:", 90],
 ["point towards %m.spriteOrMouse", " ", 1, "pointTowards:", ""],
 ["--"],
 ["go to x:%n y:%n", " ", 1, "gotoX:y:"],
 ["go to %m.spriteOrMouse", " ", 1, "gotoSpriteOrMouse:", "mouse-pointer"],
 ["glide %n secs to x:%n y:%n", " ", 1, "glideSecs:toX:y:elapsed:from:"],
 ["--"],
 ["change x by %n", " ", 1, "changeXposBy:", 10],
 ["set x to %n", " ", 1, "xpos:", 0],
 ["change y by %n", " ", 1, "changeYposBy:", 10],
 ["set y to %n", " ", 1, "ypos:", 0],
 ["--"],
 ["if on edge, bounce", " ", 1, "bounceOffEdge"],
 ["-"],
 ["set rotation style %m.rotationStyle", " ", 1, "setRotationStyle", "left-right"],
 ["--"],
 ["x position", "r", 1, "xpos"],
 ["y position", "r", 1, "ypos"],
 ["direction", "r", 1, "heading"],
 ["say %s for %n secs", " ", 2, "say:duration:elapsed:from:", "Hello!", 2],
 ["say %s", " ", 2, "say:", "Hello!"],
 ["think %s for %n secs", " ", 2, "think:duration:elapsed:from:", "Hmm...", 2],
 ["think %s", " ", 2, "think:", "Hmm..."],
 ["-"],
 ["show", " ", 2, "show"],
 ["hide", " ", 2, "hide"],
 ["-"],
 ["switch costume to %m.costume", " ", 2, "lookLike:", "costume1"],
 ["next costume", " ", 2, "nextCostume"],
 ["switch backdrop to %m.backdrop", " ", 2, "startScene", "backdrop1"],
 ["-"],
 ["change %m.effect effect by %n", " ", 2, "changeGraphicEffect:by:", "color", 25],
 ["set %m.effect effect to %n", " ", 2, "setGraphicEffect:to:", "color", 0],
 ["clear graphic effects", " ", 2, "filterReset"],
 ["-"],
 ["change size by %n", " ", 2, "changeSizeBy:", 10],
 ["set size to %n%", " ", 2, "setSizeTo:", 100],
 ["-"],
 ["go to front", " ", 2, "comeToFront"],
 ["go back %n layers", " ", 2, "goBackByLayers:", 1],
 ["-"],
 ["costume #", "r", 2, "costumeIndex"],
 ["backdrop name", "r", 2, "sceneName"],
 ["size", "r", 2, "scale"],
 ["switch backdrop to %m.backdrop", " ", 102, "startScene", "backdrop1"],
 ["switch backdrop to %m.backdrop and wait", " ", 102, "startSceneAndWait", "backdrop1"],
 ["next backdrop", " ", 102, "nextScene"],
 ["-"],
 ["change %m.effect effect by %n", " ", 102, "changeGraphicEffect:by:", "color", 25],
 ["set %m.effect effect to %n", " ", 102, "setGraphicEffect:to:", "color", 0],
 ["clear graphic effects", " ", 102, "filterReset"],
 ["-"],
 ["turn video %m.videoState", " ", 102, "setVideoState", "off"],
 ["set video transparency to %n%", " ", 102, "setVideoTransparency", 50],
 ["-"],
 ["backdrop name", "r", 102, "sceneName"],
 ["backdrop #", "r", 102, "backgroundIndex"],
 ["play sound %m.sound", " ", 3, "playSound:", "pop"],
 ["play sound %m.sound until done", " ", 3, "doPlaySoundAndWait", "pop"],
 ["stop all sounds", " ", 3, "stopAllSounds"],
 ["-"],
 ["play drum %d.drum for %n beats", " ", 3, "playDrum", 1, 0.2],
 ["rest for %n beats", " ", 3, "rest:elapsed:from:", 0.2],
 ["-"],
 ["play note %d.note for %n beats", " ", 3, "noteOn:duration:elapsed:from:", 60, 0.5],
 ["set instrument to %d.instrument", " ", 3, "instrument:", 1],
 ["-"],
 ["change volume by %n", " ", 3, "changeVolumeBy:", -10],
 ["set volume to %n%", " ", 3, "setVolumeTo:", 100],
 ["volume", "r", 3, "volume"],
 ["-"],
 ["change tempo by %n", " ", 3, "changeTempoBy:", 20],
 ["set tempo to %n bpm", " ", 3, "setTempoTo:", 60],
 ["tempo", "r", 3, "tempo"],
 ["clear", " ", 4, "clearPenTrails"],
 ["-"],
 ["stamp", " ", 4, "stampCostume"],
 ["-"],
 ["pen down", " ", 4, "putPenDown"],
 ["pen up", " ", 4, "putPenUp"],
 ["-"],
 ["set pen color to %c", " ", 4, "penColor:"],
 ["change pen color by %n", " ", 4, "changePenHueBy:"],
 ["set pen color to %n", " ", 4, "setPenHueTo:", 0],
 ["-"],
 ["change pen shade by %n", " ", 4, "changePenShadeBy:"],
 ["set pen shade to %n", " ", 4, "setPenShadeTo:", 50],
 ["-"],
 ["change pen size by %n", " ", 4, "changePenSizeBy:", 1],
 ["set pen size to %n", " ", 4, "penSize:", 1],
 ["-"],
 ["clear", " ", 104, "clearPenTrails"],
 ["when @greenFlag clicked", "h", 5, "whenGreenFlag"],
 ["when %m.key key pressed", "h", 5, "whenKeyPressed", "space"],
 ["when this sprite clicked", "h", 5, "whenClicked"],
 ["when backdrop switches to %m.backdrop", "h", 5, "whenSceneStarts", "backdrop1"],
 ["--"],
 ["when %m.triggerSensor > %n", "h", 5, "whenSensorGreaterThan", "loudness", 10],
 ["--"],
 ["when I receive %m.broadcast", "h", 5, "whenIReceive", ""],
 ["broadcast %m.broadcast", " ", 5, "broadcast:", ""],
 ["broadcast %m.broadcast and wait", " ", 5, "doBroadcastAndWait", ""],
 ["wait %n secs", " ", 6, "wait:elapsed:from:", 1],
 ["-"],
 ["repeat %n", "c", 6, "doRepeat", 10],
 ["forever", "cf", 6, "doForever"],
 ["-"],
 ["if %b then", "c", 6, "doIf"],
 ["if %b then", "e", 6, "doIfElse"],
 ["wait until %b", " ", 6, "doWaitUntil"],
 ["repeat until %b", "c", 6, "doUntil"],
 ["-"],
 ["stop %m.stop", "f", 6, "stopScripts", "all"],
 ["-"],
 ["when I start as a clone", "h", 6, "whenCloned"],
 ["create clone of %m.spriteOnly", " ", 6, "createCloneOf"],
 ["delete this clone", "f", 6, "deleteClone"],
 ["-"],
 ["wait %n secs", " ", 106, "wait:elapsed:from:", 1],
 ["-"],
 ["repeat %n", "c", 106, "doRepeat", 10],
 ["forever", "cf", 106, "doForever"],
 ["-"],
 ["if %b then", "c", 106, "doIf"],
 ["if %b then", "e", 106, "doIfElse"],
 ["wait until %b", " ", 106, "doWaitUntil"],
 ["repeat until %b", "c", 106, "doUntil"],
 ["-"],
 ["stop %m.stop", "f", 106, "stopScripts", "all"],
 ["-"],
 ["create clone of %m.spriteOnly", " ", 106, "createCloneOf"],
 ["touching %m.touching?", "b", 7, "touching:", ""],
 ["touching color %c?", "b", 7, "touchingColor:"],
 ["color %c is touching %c?", "b", 7, "color:sees:"],
 ["distance to %m.spriteOrMouse", "r", 7, "distanceTo:", ""],
 ["-"],
 ["ask %s and wait", " ", 7, "doAsk", "What's your name?"],
 ["answer", "r", 7, "answer"],
 ["-"],
 ["key %m.key pressed?", "b", 7, "keyPressed:", "space"],
 ["mouse down?", "b", 7, "mousePressed"],
 ["mouse x", "r", 7, "mouseX"],
 ["mouse y", "r", 7, "mouseY"],
 ["-"],
 ["loudness", "r", 7, "soundLevel"],
 ["video %m.videoMotionType on %m.stageOrThis", "r", 7, "senseVideoMotion", "motion", "_stage_"],
 ["-"],
 ["timer", "r", 7, "timer"],
 ["reset timer", " ", 7, "timerReset"],
 ["-"],
 ["%m.attribute of %m.spriteOrStage", "r", 7, "getAttribute:of:"],
 ["-"],
 ["current %m.timeAndDate", "r", 7, "timeAndDate", "minute"],
 ["days since 2000", "r", 7, "timestamp"],
 ["username", "r", 7, "getUserName"],
 ["ask %s and wait", " ", 107, "doAsk", "What's your name?"],
 ["answer", "r", 107, "answer"],
 ["-"],
 ["key %m.key pressed?", "b", 107, "keyPressed:", "space"],
 ["mouse down?", "b", 107, "mousePressed"],
 ["mouse x", "r", 107, "mouseX"],
 ["mouse y", "r", 107, "mouseY"],
 ["-"],
 ["loudness", "r", 107, "soundLevel"],
 ["video %m.videoMotionType on %m.stageOrThis", "r", 107, "senseVideoMotion", "motion", "Stage"],
 ["-"],
 ["timer", "r", 107, "timer"],
 ["reset timer", " ", 107, "timerReset"],
 ["-"],
 ["%m.attribute of %m.spriteOrStage", "r", 107, "getAttribute:of:"],
 ["-"],
 ["current %m.timeAndDate", "r", 107, "timeAndDate", "minute"],
 ["days since 2000", "r", 107, "timestamp"],
 ["username", "r", 107, "getUserName"],
 ["%n + %n", "r", 8, "+", "", ""],
 ["%n - %n", "r", 8, "-", "", ""],
 ["%n * %n", "r", 8, "*", "", ""],
 ["%n / %n", "r", 8, "/", "", ""],
 ["-"],
 ["pick random %n to %n", "r", 8, "randomFrom:to:", 1, 10],
 ["-"],
 ["%s < %s", "b", 8, "<", "", ""],
 ["%s = %s", "b", 8, "=", "", ""],
 ["%s > %s", "b", 8, ">", "", ""],
 ["-"],
 ["%b and %b", "b", 8, "&"],
 ["%b or %b", "b", 8, "|"],
 ["not %b", "b", 8, "not"],
 ["-"],
 ["join %s %s", "r", 8, "concatenate:with:", "hello ", "world"],
 ["letter %n of %s", "r", 8, "letter:of:", 1, "world"],
 ["length of %s", "r", 8, "stringLength:", "world"],
 ["-"],
 ["%n mod %n", "r", 8, "%", "", ""],
 ["round %n", "r", 8, "rounded", ""],
 ["-"],
 ["%m.mathOp of %n", "r", 8, "computeFunction:of:", "sqrt", 9],
 ["set %m.var to %s", " ", 9, SET_VAR],
 ["change %m.var by %n", " ", 9, CHANGE_VAR],
 ["show variable %m.var", " ", 9, "showVariable:"],
 ["hide variable %m.var", " ", 9, "hideVariable:"],
 ["add %s to %m.list", " ", 12, "append:toList:"],
 ["-"],
 ["delete %d.listDeleteItem of %m.list", " ", 12, "deleteLine:ofList:"],
 ["insert %s at %d.listItem of %m.list", " ", 12, "insert:at:ofList:"],
 ["replace item %d.listItem of %m.list with %s", " ", 12, "setLine:ofList:to:"],
 ["-"],
 ["item %d.listItem of %m.list", "r", 12, "getLine:ofList:"],
 ["length of %m.list", "r", 12, "lineCountOfList:"],
 ["%m.list contains %s", "b", 12, "list:contains:"],
 ["-"],
 ["show list %m.list", " ", 12, "showList:"],
 ["hide list %m.list", " ", 12, "hideList:"],
 ["when %m.booleanSensor", "h", 20, "whenSensorConnected", "button pressed"],
 ["-"],
 ["sensor %m.booleanSensor?", "b", 20, "sensorPressed:", "button pressed"],
 ["%m.sensor sensor value", "r", 20, "sensor:", "slider"],
 ["turn motor on for %n secs", " ", 20, "motorOnFor:elapsed:from:", 1],
 ["turn motor on", " ", 20, "allMotorsOn"],
 ["turn motor off", " ", 20, "allMotorsOff"],
 ["set motor power %n", " ", 20, "startMotorPower:", 100],
 ["set motor direction %m.motorDirection", " ", 20, "setMotorDirection:", "this way"],
 ["--"],
 ["when distance < %n", "h", 20, "whenDistanceLessThan", 20],
 ["when tilt = %n", "h", 20, "whenTiltIs", 1],
 ["-"],
 ["distance", "r", 20, "wedoDistance"],
 ["tilt", "r", 20, "wedoTilt"],
 ["play drum %n for %n beats", " ", 98, "drum:duration:elapsed:from:", 1, 0.2],
 ["set instrument to %n", " ", 98, "midiInstrument:", 1],
 ["loud?", "b", 98, "isLoud"],
 ["abs %n", "r", 98, "abs"],
 ["sqrt %n", "r", 98, "sqrt"],
 ["stop script", "f", 98, "doReturn"],
 ["stop all", "f", 98, "stopAll"],
 ["switch to background %m.costume", " ", 98, "showBackground:", "backdrop1"],
 ["next background", " ", 98, "nextBackground"],
 ["forever if %b", "cf", 98, "doForeverIf"],
 ["noop", "r", 99, "COUNT"],
 ["counter", "r", 99, "COUNT"],
 ["clear counter", " ", 99, "CLR_COUNT"],
 ["incr counter", " ", 99, "INCR_COUNT"],
 ["for each %m.varName in %s", "c", 99, "doForLoop", "v", 10],
 ["while %b", "c", 99, "doWhile"],
 ["all at once", "c", 99, "warpSpeed"],
 ["scroll right %n", " ", 99, "scrollRight", 10],
 ["scroll up %n", " ", 99, "scrollUp", 10],
 ["align scene %m.scrollAlign", " ", 99, "scrollAlign", "bottom-left"],
 ["x scroll", "r", 99, "xScroll"],
 ["y scroll", "r", 99, "yScroll"],
 ["hide all sprites", " ", 99, "hideAll"],
 ["user id", "r", 99, "getUserId"]];



var gen = function () {
    var gen = {};

    var commands = {}

    gen.gen_commands = function (translations) {
        $.each(BLOCKS, function (i, blockspec) {
            var block = {
                text: translate_blocktext(blockspec[0], translations),
                flag: blockspec[1],
                category_id: blockspec[2],
                command: blockspec[3],
                defaults: blockspec.slice(4)
            }
            block.parts = parse_block_parts(block.text);
            commands[block.command] = block;
        });
    }
    gen.gen_commands();

    function translate_blocktext (block_text, translations) {
        if (translations === undefined) return block_text;

        var min_block = block_text.replace(/(%.(?:\.[A-z]+)?)/g, '_');
        min_block = min_block.replace('@greenFlag', '@green-flag');
        min_block = min_block.replace('@turnLeft', '@arrow-ccw');
        min_block = min_block.replace('@turnRight', '@arrow-cw');

        if (!(min_block in translations.blocks) || translations.blocks[min_block] === '') return block_text;

        var translated_block = translations.blocks[min_block];
        var args = block_text.match(/(%.(?:\.[A-z]+)?)/g);
        return translated_block.replace(/_/g, function() { return args.shift(); });
    }

    function parse_block_parts (block_text) {
        return $.grep(
            block_text.split(/(%.(?:\.[A-z]+)?)/),
            function (x) { return x }
        );
    }

    function render_custom_definition_arg (value, shape) {
        switch (shape.substr(0, 2)) {
            case "%b":
                return "<"+value+">";

            default:
                return "("+value+")";
        }
    }

    function render_insert (value, shape) {
        switch (shape.substr(0, 2)) {
            case "%n":
                return "("+value+")";

            case "%d":
                return "("+value+" v)";

            case "%s":
                return "["+value+"]";

            case "%m":
                return "["+value+" v]";

            case "%c":
                value = (value >>> 0) & 0xffffff
                var hex = parseInt(value).toString(16)
                while (hex.length < 6) {
                    hex = "0" + hex;
                }
                return "[#"+hex+"]";

            case "%b":
                if (value === false) {
                    // if < > then
                    return "< >";
                } else {
                    return "<"+value+">"; // unused
                }

            default:
                return "*"+value+"*"; // DEBUG
        }
    }

    function render_cmouth (blocks) {
        var blocks = blocks || [],
            out = "";
        if (!blocks.length) {
            out = "\n    ";
        } else {
            $.each(blocks, function (i, block) {
                var lines = render_block(block).split("\n"); 
                for (i=0; i<lines.length; i++) {
                    out += "\n";
                    out += "    "+lines[i];
                }
            });
        }
        return out;
    }
   
    function render_block (block) {
        var out = "",
            command,
            args,
            is_custom_definition = false;

        switch (block[0]) {
            case "readVariable":
            case "getParam":
            case "contentsOfList:":
                return "("+block[1]+")";

            case "procDef":
                out = "define ";
                command = {
                    text: block[1],
                    defaults: block[3],
                    flag: " "
                }
                args = block[2];
                is_custom_definition = true;
                break;

            case "call": // custom block
                command = {
                    text: block[1],
                    defaults: [],
                    flag: " "
                }
                args = block.slice(2);
                break;

            default:
                command = commands[block[0]],
                args = block.slice(1);
                
                if (!command) {
                    return "**"+JSON.stringify(block)+"**";
                }

                break;
        }
        
        if (!command.parts) {
            command.parts = parse_block_parts(command.text);
        }

        var defaults = command.defaults,
            parts = command.parts;

        // clone arg arrays
        args = args.slice(0);
        defaults = defaults.slice(0);

        $.each(parts, function (i, part) {
            if (/^%[A-z]/.test(part)) {
                // insert
                var value = defaults.shift();
                if (args) {
                    value = args.shift();
                }

                if (is_custom_definition) {
                    out += render_custom_definition_arg(value, part);
                } else {
                    if (value instanceof Array) {
                        out += render_block(value);
                    } else {
                        out += render_insert(value, part);
                    }
                }
            } else {
                out += part;
            }
        });

        if (/c|e|cf/.test(command.flag)) {
            out += render_cmouth(args.shift());

            if (command.flag == "e") {
                out += "\nelse";
                out += render_cmouth(args.shift());
            }

            out += "\nend";
        }

        switch (command.flag) {
            case "r": // reporter
                out = "("+out+")";
                break;

            case "b": // boolean
                out = "<"+out+">";
                break;
        }

        out = out.replace("@greenFlag", "green flag");
        out = out.replace("@turnLeft", "cw");
        out = out.replace("@turnRight", "ccw");
        out = out.replace("_myself_", "myself");
        out = out.replace("_mouse_", "mouse-pointer");

        return out;
    }

    function render_script (script) {
        var script_blocks = script.slice(2)[0];
        var out = "";

        $.each(script_blocks, function (i, block) {
            out += render_block(block) + "\n";
        });

        return out;
    }

    gen.generate = function (script) {
        return render_script(script);
    }
    

    // DEBUG
    gen.render_block = render_block;
    gen.render_script = render_script;
    gen.commands = commands;

    return gen;
}();

