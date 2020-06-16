/*
    When a new extension is added:
    1) Add it to EXTENSIONS list
    2) Add its blocks to commands.js
    3) Add icon width/height to scratch3/blocks.js IconView
    4) Add icon to scratch3/style.js
*/

// Moved extensions: key is scratch3, value is scratch2
const MOVED_EXTENSIONS = {
    pen: "pen",
    video: "sensing",
    music: "sound"
}

const EXTENSIONS = [
    "tts",
    "translate",
    "microbit",
    "wedo2",
    "makeymakey",
    "ev3",
    "boost",
    "gdxfor"
].concat(Object.keys(MOVED_EXTENSIONS))

module.exports = {
    default: EXTENSIONS,
    MOVED_EXTENSIONS
}
