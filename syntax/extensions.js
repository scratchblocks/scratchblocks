/*
    When a new extension is added:
    1) Add it to extensions object
    2) Add its blocks to commands.js
    3) Add icon width/height to scratch3/blocks.js IconView
    4) Add icon to scratch3/style.js
*/

// Moved extensions: key is scratch3, value is scratch2
const movedExtensions = {
  pen: "pen",
  video: "sensing",
  music: "sound",
}

const extensions = {
  ...movedExtensions,
  tts: "tts",
  translate: "translate",
  microbit: "microbit",
  wedo: "wedo",
  makeymakey: "makeymakey",
  ev3: "ev3",
  boost: "boost",
  gdxfor: "gdxfor",
}

// Alias extensions: unlike movedExtensions, this is handled for both scratch2 and scratch3.
// Key is alias, value is real extension name
const aliasExtensions = {
  wedo2: "wedo",
  text2speech: "tts",
}

module.exports = {
  extensions,
  movedExtensions,
  aliasExtensions,
}
