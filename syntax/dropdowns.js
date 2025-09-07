export const dropdowns = [
  { id: "MOTION_GOTO_POINTER", spec: "mouse-pointer" },
  { id: "MOTION_GOTO_RANDOM", spec: "random position" },
  { id: "MOTION_POINTTOWARDS_RANDOM", spec: "random direction" },
  { id: "MOTION_SETROTATIONSTYLE_LEFTRIGHT", spec: "left-right" },
  { id: "MOTION_SETROTATIONSTYLE_DONTROTATE", spec: "don't rotate" },
  { id: "MOTION_SETROTATIONSTYLE_ALLAROUND", spec: "all around" },
  { id: "LOOKS_EFFECT_COLOR", spec: "color" },
  { id: "LOOKS_EFFECT_FISHEYE", spec: "fisheye" },
  { id: "LOOKS_EFFECT_WHIRL", spec: "whirl" },
  { id: "LOOKS_EFFECT_PIXELATE", spec: "pixelate" },
  { id: "LOOKS_EFFECT_MOSAIC", spec: "mosaic" },
  { id: "LOOKS_EFFECT_BRIGHTNESS", spec: "brightness" },
  { id: "LOOKS_EFFECT_GHOST", spec: "ghost" },
  { id: "LOOKS_GOTOFRONTBACK_FRONT", spec: "front" },
  { id: "LOOKS_GOTOFRONTBACK_BACK", spec: "back" },
  { id: "LOOKS_GOFORWARDBACKWARDLAYERS_FORWARD", spec: "forward" },
  { id: "LOOKS_GOFORWARDBACKWARDLAYERS_BACKWARD", spec: "backward" },
  { id: "LOOKS_NUMBERNAME_NUMBER", spec: "number" },
  { id: "LOOKS_NUMBERNAME_NAME", spec: "name" },
  { id: "SOUND_EFFECTS_PITCH", spec: "pitch" },
  { id: "SOUND_EFFECTS_PAN", spec: "pan left/right" },
  { id: "EVENT_WHENKEYPRESSED_SPACE", spec: "space" },
  { id: "EVENT_WHENKEYPRESSED_LEFT", spec: "left arrow" },
  { id: "EVENT_WHENKEYPRESSED_RIGHT", spec: "right arrow" },
  { id: "EVENT_WHENKEYPRESSED_DOWN", spec: "down arrow" },
  { id: "EVENT_WHENKEYPRESSED_UP", spec: "up arrow" },
  { id: "EVENT_WHENKEYPRESSED_ANY", spec: "any" },
  { id: "EVENT_WHENGREATERTHAN_TIMER", spec: "timer" },
  { id: "EVENT_WHENGREATERTHAN_LOUDNESS", spec: "loudness" },
  { id: "CONTROL_STOP_ALL", spec: "all" },
  { id: "CONTROL_STOP_THIS", spec: "this script" },
  { id: "CONTROL_STOP_OTHER", spec: "other scripts in sprite" },
  { id: "CONTROL_CREATECLONEOF_MYSELF", spec: "myself" },
  { id: "SENSING_TOUCHINGOBJECT_EDGE", spec: "edge" },
  { id: "SENSING_SETDRAGMODE_DRAGGABLE", spec: "draggable" },
  { id: "SENSING_SETDRAGMODE_NOTDRAGGABLE", spec: "not draggable" },
  { id: "SENSING_OF_XPOSITION", spec: "x position" },
  { id: "SENSING_OF_YPOSITION", spec: "y position" },
  { id: "SENSING_OF_DIRECTION", spec: "direction" },
  { id: "SENSING_OF_COSTUMENUMBER", spec: "costume #" },
  { id: "SENSING_OF_COSTUMENAME", spec: "costume name" },
  { id: "SENSING_OF_SIZE", spec: "size" },
  { id: "SENSING_OF_VOLUME", spec: "volume" },
  { id: "SENSING_OF_BACKDROPNUMBER", spec: "backdrop #" },
  { id: "SENSING_OF_BACKDROPNAME", spec: "backdrop name" },
  { id: "SENSING_OF_STAGE", spec: "Stage" },
  { id: "SENSING_CURRENT_YEAR", spec: "year" },
  { id: "SENSING_CURRENT_MONTH", spec: "month" },
  { id: "SENSING_CURRENT_DATE", spec: "date" },
  { id: "SENSING_CURRENT_DAYOFWEEK", spec: "day of week" },
  { id: "SENSING_CURRENT_HOUR", spec: "hour" },
  { id: "SENSING_CURRENT_MINUTE", spec: "minute" },
  { id: "SENSING_CURRENT_SECOND", spec: "second" },
  { id: "OPERATORS_MATHOP_ABS", spec: "abs" },
  { id: "OPERATORS_MATHOP_FLOOR", spec: "floor" },
  { id: "OPERATORS_MATHOP_CEILING", spec: "ceiling" },
  { id: "OPERATORS_MATHOP_SQRT", spec: "sqrt" },
  { id: "music.drumSnare", spec: "(1) Snare Drum" },
  { id: "music.drumBass", spec: "(2) Bass Drum" },
  { id: "music.drumSideStick", spec: "(3) Side Stick" },
  { id: "music.drumCrashCymbal", spec: "(4) Crash Cymbal" },
  { id: "music.drumOpenHiHat", spec: "(5) Open Hi-Hat" },
  { id: "music.drumClosedHiHat", spec: "(6) Closed Hi-Hat" },
  { id: "music.drumTambourine", spec: "(7) Tambourine" },
  { id: "music.drumHandClap", spec: "(8) Hand Clap" },
  { id: "music.drumClaves", spec: "(9) Claves" },
  { id: "music.drumWoodBlock", spec: "(10) Wood Block" },
  { id: "music.drumCowbell", spec: "(11) Cowbell" },
  { id: "music.drumTriangle", spec: "(12) Triangle" },
  { id: "music.drumBongo", spec: "(13) Bongo" },
  { id: "music.drumConga", spec: "(14) Conga" },
  { id: "music.drumCabasa", spec: "(15) Cabasa" },
  { id: "music.drumGuiro", spec: "(16) Guiro" },
  { id: "music.drumVibraslap", spec: "(17) Vibraslap" },
  { id: "music.drumCuica", spec: "(18) Cuica" },
  { id: "music.instrumentPiano", spec: "(1) Piano" },
  { id: "music.instrumentElectricPiano", spec: "(2) Electric Piano" },
  { id: "music.instrumentOrgan", spec: "(3) Organ" },
  { id: "music.instrumentGuitar", spec: "(4) Guitar" },
  { id: "music.instrumentElectricGuitar", spec: "(5) Electric Guitar" },
  { id: "music.instrumentBass", spec: "(6) Bass" },
  { id: "music.instrumentPizzicato", spec: "(7) Pizzicato" },
  { id: "music.instrumentCello", spec: "(8) Cello" },
  { id: "music.instrumentTrombone", spec: "(9) Trombone" },
  { id: "music.instrumentClarinet", spec: "(10) Clarinet" },
  { id: "music.instrumentSaxophone", spec: "(11) Saxophone" },
  { id: "music.instrumentFlute", spec: "(12) Flute" },
  { id: "music.instrumentWoodenFlute", spec: "(13) Wooden Flute" },
  { id: "music.instrumentBassoon", spec: "(14) Bassoon" },
  { id: "music.instrumentChoir", spec: "(15) Choir" },
  { id: "music.instrumentVibraphone", spec: "(16) Vibraphone" },
  { id: "music.instrumentMusicBox", spec: "(17) Music Box" },
  { id: "music.instrumentSteelDrum", spec: "(18) Steel Drum" },
  { id: "music.instrumentMarimba", spec: "(19) Marimba" },
  { id: "music.instrumentSynthLead", spec: "(20) Synth Lead" },
  { id: "music.instrumentSynthPad", spec: "(21) Synth Pad" },
  { id: "pen.colorMenu.saturation", spec: "saturation" },
  { id: "pen.colorMenu.transparency", spec: "transparency" },
  { id: "videoSensing.direction", spec: "direction" },
  { id: "videoSensing.motion", spec: "motion" },
  { id: "videoSensing.sprite", spec: "sprite" },
  { id: "videoSensing.stage", spec: "stage" },
  { id: "videoSensing.off", spec: "off" },
  { id: "videoSensing.on", spec: "on" },
  { id: "videoSensing.onFlipped", spec: "on flipped" },
  { id: "text2speech.alto", spec: "alto" },
  { id: "text2speech.tenor", spec: "tenor" },
  { id: "text2speech.squeak", spec: "squeak" },
  { id: "text2speech.giant", spec: "giant" },
  { id: "text2speech.kitten", spec: "kitten" },
  { id: "makeymakey.upArrowShort", spec: "up" },
  { id: "makeymakey.downArrowShort", spec: "down" },
  { id: "makeymakey.leftArrowShort", spec: "left" },
  { id: "makeymakey.rightArrowShort", spec: "right" },
  { id: "microbit.gesturesMenu.jumped", spec: "jumped" },
  { id: "microbit.gesturesMenu.moved", spec: "moved" },
  { id: "microbit.gesturesMenu.shaken", spec: "shaken" },
  { id: "microbit.tiltDirectionMenu.back", spec: "back" },
  { id: "microbit.tiltDirectionMenu.front", spec: "front" },
  { id: "microbit.tiltDirectionMenu.left", spec: "left" },
  { id: "microbit.tiltDirectionMenu.right", spec: "right" },
  { id: "boost.motorDirection.backward", spec: "that way" },
  { id: "boost.motorDirection.forward", spec: "this way" },
  { id: "boost.motorDirection.reverse", spec: "reverse" },
  { id: "boost.color.any", spec: "any color" },
  { id: "boost.color.black", spec: "black" },
  { id: "boost.color.blue", spec: "blue" },
  { id: "boost.color.green", spec: "green" },
  { id: "boost.color.red", spec: "red" },
  { id: "boost.color.white", spec: "white" },
  { id: "boost.color.yellow", spec: "yellow" },
  { id: "wedo2.motorId.a", spec: "motor A" },
  { id: "wedo2.motorId.b", spec: "motor B" },
  { id: "wedo2.motorId.all", spec: "all motors" },
  { id: "wedo2.motorId.default", spec: "motor" },
  { id: "gdxfor.pulled", spec: "pulled" },
  { id: "gdxfor.pushed", spec: "pushed" },
  { id: "gdxfor.shaken", spec: "shaken" },
  { id: "gdxfor.startedFalling", spec: "started falling" },
  { id: "gdxfor.turnedFaceDown", spec: "turned face down" },
  { id: "gdxfor.turnedFaceUp", spec: "turned face up" },
]

const scratchSpokenLanguageCodes = [
  "ar",
  "zh-cn",
  "da",
  "nl",
  "en",
  "fr",
  "de",
  "hi",
  "is",
  "it",
  "ja",
  "ko",
  "nb",
  "pl",
  "pt-br",
  "pt",
  "ro",
  "ru",
  "es",
  "es-419",
  "sv",
  "tr",
  "cy",
]

function getSpokenLanguageMenu(lang, languageNames, localeNames) {
  const localizedNameMap = {}
  let nameArray = languageNames.menuMap[lang]
  if (nameArray) {
    let spokenNameArray = []
    if (languageNames.spokenLanguages) {
      spokenNameArray = languageNames.spokenLanguages[lang]
      nameArray = nameArray.concat(spokenNameArray)
    }
    nameArray.forEach(lang => {
      localizedNameMap[lang.code] = lang.name
    })
  }

  return Object.keys(localeNames).map(key => {
    let name = localeNames[key].name
    const localizedName = localizedNameMap[key]
    if (localizedName) {
      name = localizedName
    }
    name = name.charAt(0).toUpperCase() + name.slice(1)
    return { text: name, value: key }
  })
}

export function getLanguageDropdowns(lang, languageNames, localeNames) {
  const localeDropdowns = {}
  languageNames.menuMap[lang]?.forEach(info => {
    localeDropdowns["translate.language." + info.code] = info.name
  })
  getSpokenLanguageMenu(lang, languageNames, localeNames).forEach(info => {
    if (scratchSpokenLanguageCodes.includes(info.value)) {
      localeDropdowns["text2speech.language." + info.value] = info.text
    }
  })
  return localeDropdowns
}

export function getMakeyMakeySequenceDropdowns(dropdowns) {
  const raw = [
    "left up right",
    "right up left",
    "left right",
    "right left",
    "up down",
    "down up",
    "up right down left",
    "up left down right",
    "up up down down left right left right",
  ]
  const result = {}
  raw.forEach((spec, index) => {
    result[`makeymakey.sequence.${index}`] = spec
      .replaceAll("left", dropdowns["makeymakey.leftArrowShort"])
      .replaceAll("right", dropdowns["makeymakey.rightArrowShort"])
      .replaceAll("up", dropdowns["makeymakey.upArrowShort"])
      .replaceAll("down", dropdowns["makeymakey.downArrowShort"])
  })
  return result
}
