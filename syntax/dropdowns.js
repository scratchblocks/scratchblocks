export const dropdowns = [
  { id: "MOTION_GOTO_POINTER", value: "mouse-pointer" },
  { id: "MOTION_GOTO_RANDOM", value: "random position" },
  { id: "MOTION_GLIDETO_POINTER", value: "mouse-pointer" },
  { id: "MOTION_GLIDETO_RANDOM", value: "random position" },
  { id: "MOTION_POINTTOWARDS_POINTER", value: "mouse-pointer" },
  { id: "MOTION_POINTTOWARDS_RANDOM", value: "random direction" },
  { id: "MOTION_SETROTATIONSTYLE_LEFTRIGHT", value: "left-right" },
  { id: "MOTION_SETROTATIONSTYLE_DONTROTATE", value: "don't rotate" },
  { id: "MOTION_SETROTATIONSTYLE_ALLAROUND", value: "all around" },
  {
    id: "LOOKS_NEXTBACKDROP",
    value: "next backdrop",
    parents: ["LOOKS_SWITCHBACKDROPTO"],
  },
  {
    id: "LOOKS_PREVIOUSBACKDROP",
    value: "previous backdrop",
    parents: ["LOOKS_SWITCHBACKDROPTO"],
  },
  {
    id: "LOOKS_RANDOMBACKDROP",
    value: "random backdrop",
    parents: ["LOOKS_SWITCHBACKDROPTO"],
  },
  {
    id: "LOOKS_EFFECT_COLOR",
    value: "color",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_FISHEYE",
    value: "fisheye",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_WHIRL",
    value: "whirl",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_PIXELATE",
    value: "pixelate",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_MOSAIC",
    value: "mosaic",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_BRIGHTNESS",
    value: "brightness",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  {
    id: "LOOKS_EFFECT_GHOST",
    value: "ghost",
    parents: ["LOOKS_SETEFFECTTO", "LOOKS_CHANGEEFFECTBY"],
  },
  { id: "LOOKS_GOTOFRONTBACK_FRONT", value: "front" },
  { id: "LOOKS_GOTOFRONTBACK_BACK", value: "back" },
  { id: "LOOKS_GOFORWARDBACKWARDLAYERS_FORWARD", value: "forward" },
  { id: "LOOKS_GOFORWARDBACKWARDLAYERS_BACKWARD", value: "backward" },
  {
    id: "LOOKS_NUMBERNAME_NUMBER",
    value: "number",
    parents: ["LOOKS_COSTUMENUMBERNAME", "LOOKS_BACKDROPNUMBERNAME"],
  },
  {
    id: "LOOKS_NUMBERNAME_NAME",
    value: "name",
    parents: ["LOOKS_COSTUMENUMBERNAME", "LOOKS_BACKDROPNUMBERNAME"],
  },
  {
    id: "SOUND_EFFECTS_PITCH",
    value: "pitch",
    parents: ["SOUND_CHANGEEFFECTBY", "SOUND_SETEFFECTO"],
  },
  {
    id: "SOUND_EFFECTS_PAN",
    value: "pan left/right",
    parents: ["SOUND_CHANGEEFFECTBY", "SOUND_SETEFFECTO"],
  },
  {
    id: "EVENT_WHENKEYPRESSED_SPACE",
    value: "space",
    parents: [
      "EVENT_WHENKEYPRESSED",
      "SENSING_KEYPRESSED",
      "makeymakey.whenKeyPressed",
    ],
  },
  {
    id: "EVENT_WHENKEYPRESSED_LEFT",
    value: "left arrow",
    parents: [
      "EVENT_WHENKEYPRESSED",
      "SENSING_KEYPRESSED",
      "makeymakey.whenKeyPressed",
    ],
  },
  {
    id: "EVENT_WHENKEYPRESSED_RIGHT",
    value: "right arrow",
    parents: [
      "EVENT_WHENKEYPRESSED",
      "SENSING_KEYPRESSED",
      "makeymakey.whenKeyPressed",
    ],
  },
  {
    id: "EVENT_WHENKEYPRESSED_DOWN",
    value: "down arrow",
    parents: [
      "EVENT_WHENKEYPRESSED",
      "SENSING_KEYPRESSED",
      "makeymakey.whenKeyPressed",
    ],
  },
  {
    id: "EVENT_WHENKEYPRESSED_UP",
    value: "up arrow",
    parents: [
      "EVENT_WHENKEYPRESSED",
      "SENSING_KEYPRESSED",
      "makeymakey.whenKeyPressed",
    ],
  },
  {
    id: "EVENT_WHENKEYPRESSED_ANY",
    value: "any",
    parents: ["EVENT_WHENKEYPRESSED", "SENSING_KEYPRESSED"],
  },
  {
    id: "EVENT_WHENGREATERTHAN_TIMER",
    value: "timer",
    parents: ["EVENT_WHENGREATERTHAN"],
  },
  {
    id: "EVENT_WHENGREATERTHAN_LOUDNESS",
    value: "loudness",
    parents: ["EVENT_WHENGREATERTHAN"],
  },
  { id: "CONTROL_STOP_ALL", value: "all" },
  { id: "CONTROL_STOP_THIS", value: "this script" },
  { id: "CONTROL_STOP_OTHER", value: "other scripts in sprite" },
  { id: "CONTROL_CREATECLONEOF_MYSELF", value: "myself" },
  { id: "SENSING_TOUCHINGOBJECT_POINTER", value: "mouse-pointer" },
  { id: "SENSING_TOUCHINGOBJECT_EDGE", value: "edge" },
  { id: "SENSING_DISTANCETO_POINTER", value: "mouse-pointer" },
  { id: "SENSING_SETDRAGMODE_DRAGGABLE", value: "draggable" },
  { id: "SENSING_SETDRAGMODE_NOTDRAGGABLE", value: "not draggable" },
  { id: "SENSING_OF_XPOSITION", value: "x position" },
  { id: "SENSING_OF_YPOSITION", value: "y position" },
  { id: "SENSING_OF_DIRECTION", value: "direction" },
  { id: "SENSING_OF_COSTUMENUMBER", value: "costume #" },
  { id: "SENSING_OF_COSTUMENAME", value: "costume name" },
  { id: "SENSING_OF_SIZE", value: "size" },
  { id: "SENSING_OF_VOLUME", value: "volume" },
  { id: "SENSING_OF_BACKDROPNUMBER", value: "backdrop #" },
  { id: "SENSING_OF_BACKDROPNAME", value: "backdrop name" },
  { id: "SENSING_OF_STAGE", value: "Stage" },
  { id: "SENSING_CURRENT_YEAR", value: "year" },
  { id: "SENSING_CURRENT_MONTH", value: "month" },
  { id: "SENSING_CURRENT_DATE", value: "date" },
  { id: "SENSING_CURRENT_DAYOFWEEK", value: "day of week" },
  { id: "SENSING_CURRENT_HOUR", value: "hour" },
  { id: "SENSING_CURRENT_MINUTE", value: "minute" },
  { id: "SENSING_CURRENT_SECOND", value: "second" },
  { id: "OPERATORS_MATHOP_ABS", value: "abs" },
  { id: "OPERATORS_MATHOP_FLOOR", value: "floor" },
  { id: "OPERATORS_MATHOP_CEILING", value: "ceiling" },
  { id: "OPERATORS_MATHOP_SQRT", value: "sqrt" },
  { id: "OPERATORS_MATHOP_SIN", value: "sin" },
  { id: "OPERATORS_MATHOP_COS", value: "cos" },
  { id: "OPERATORS_MATHOP_TAN", value: "tan" },
  { id: "OPERATORS_MATHOP_ASIN", value: "asin" },
  { id: "OPERATORS_MATHOP_ACOS", value: "acos" },
  { id: "OPERATORS_MATHOP_ATAN", value: "atan" },
  { id: "OPERATORS_MATHOP_LN", value: "ln" },
  { id: "OPERATORS_MATHOP_LOG", value: "log" },
  { id: "OPERATORS_MATHOP_EEXP", value: "e ^" },
  { id: "OPERATORS_MATHOP_10EXP", value: "10 ^" },
  { id: "music.drumSnare", value: "(1) Snare Drum" },
  { id: "music.drumBass", value: "(2) Bass Drum" },
  { id: "music.drumSideStick", value: "(3) Side Stick" },
  { id: "music.drumCrashCymbal", value: "(4) Crash Cymbal" },
  { id: "music.drumOpenHiHat", value: "(5) Open Hi-Hat" },
  { id: "music.drumClosedHiHat", value: "(6) Closed Hi-Hat" },
  { id: "music.drumTambourine", value: "(7) Tambourine" },
  { id: "music.drumHandClap", value: "(8) Hand Clap" },
  { id: "music.drumClaves", value: "(9) Claves" },
  { id: "music.drumWoodBlock", value: "(10) Wood Block" },
  { id: "music.drumCowbell", value: "(11) Cowbell" },
  { id: "music.drumTriangle", value: "(12) Triangle" },
  { id: "music.drumBongo", value: "(13) Bongo" },
  { id: "music.drumConga", value: "(14) Conga" },
  { id: "music.drumCabasa", value: "(15) Cabasa" },
  { id: "music.drumGuiro", value: "(16) Guiro" },
  { id: "music.drumVibraslap", value: "(17) Vibraslap" },
  { id: "music.drumCuica", value: "(18) Cuica" },
  { id: "music.instrumentPiano", value: "(1) Piano" },
  { id: "music.instrumentElectricPiano", value: "(2) Electric Piano" },
  { id: "music.instrumentOrgan", value: "(3) Organ" },
  { id: "music.instrumentGuitar", value: "(4) Guitar" },
  { id: "music.instrumentElectricGuitar", value: "(5) Electric Guitar" },
  { id: "music.instrumentBass", value: "(6) Bass" },
  { id: "music.instrumentPizzicato", value: "(7) Pizzicato" },
  { id: "music.instrumentCello", value: "(8) Cello" },
  { id: "music.instrumentTrombone", value: "(9) Trombone" },
  { id: "music.instrumentClarinet", value: "(10) Clarinet" },
  { id: "music.instrumentSaxophone", value: "(11) Saxophone" },
  { id: "music.instrumentFlute", value: "(12) Flute" },
  { id: "music.instrumentWoodenFlute", value: "(13) Wooden Flute" },
  { id: "music.instrumentBassoon", value: "(14) Bassoon" },
  { id: "music.instrumentChoir", value: "(15) Choir" },
  { id: "music.instrumentVibraphone", value: "(16) Vibraphone" },
  { id: "music.instrumentMusicBox", value: "(17) Music Box" },
  { id: "music.instrumentSteelDrum", value: "(18) Steel Drum" },
  { id: "music.instrumentMarimba", value: "(19) Marimba" },
  { id: "music.instrumentSynthLead", value: "(20) Synth Lead" },
  { id: "music.instrumentSynthPad", value: "(21) Synth Pad" },
  {
    id: "pen.colorMenu.color",
    value: "color",
    parents: ["pen.setColorParam", "pen.changeColorParam"],
  },
  {
    id: "pen.colorMenu.saturation",
    value: "saturation",
    parents: ["pen.setColorParam", "pen.changeColorParam"],
  },
  {
    id: "pen.colorMenu.brightness",
    value: "brightness",
    parents: ["pen.setColorParam", "pen.changeColorParam"],
  },
  {
    id: "pen.colorMenu.transparency",
    value: "transparency",
    parents: ["pen.setColorParam", "pen.changeColorParam"],
  },
  {
    id: "videoSensing.direction",
    value: "direction",
    parents: ["videoSensing.videoOn"],
  },
  {
    id: "videoSensing.motion",
    value: "motion",
    parents: ["videoSensing.videoOn"],
  },
  {
    id: "videoSensing.sprite",
    value: "sprite",
    parents: ["videoSensing.videoOn"],
  },
  {
    id: "videoSensing.stage",
    value: "stage",
    parents: ["videoSensing.videoOn"],
  },
  {
    id: "videoSensing.off",
    value: "off",
    parents: ["videoSensing.videoToggle"],
  },
  { id: "videoSensing.on", value: "on", parents: ["videoSensing.videoToggle"] },
  {
    id: "videoSensing.onFlipped",
    value: "on flipped",
    parents: ["videoSensing.videoToggle"],
  },
  {
    id: "text2speech.alto",
    value: "alto",
    parents: ["text2speech.setVoiceBlock"],
  },
  {
    id: "text2speech.tenor",
    value: "tenor",
    parents: ["text2speech.setVoiceBlock"],
  },
  {
    id: "text2speech.squeak",
    value: "squeak",
    parents: ["text2speech.setVoiceBlock"],
  },
  {
    id: "text2speech.giant",
    value: "giant",
    parents: ["text2speech.setVoiceBlock"],
  },
  {
    id: "text2speech.kitten",
    value: "kitten",
    parents: ["text2speech.setVoiceBlock"],
  },
  {
    id: "makeymakey.upArrowShort",
    value: "up",
    parents: ["makeymakey.whenKeyPressed"],
  },
  {
    id: "makeymakey.downArrowShort",
    value: "down",
    parents: ["makeymakey.whenKeyPressed"],
  },
  {
    id: "makeymakey.leftArrowShort",
    value: "left",
    parents: ["makeymakey.whenKeyPressed"],
  },
  {
    id: "makeymakey.rightArrowShort",
    value: "right",
    parents: ["makeymakey.whenKeyPressed"],
  },
  {
    id: "microbit.buttonsMenu.any",
    value: "any",
    parents: ["microbit.whenButtonPressed", "microbit.isButtonPressed"],
  },
  {
    id: "microbit.gesturesMenu.jumped",
    value: "jumped",
    parents: ["microbit.whenGesture"],
  },
  {
    id: "microbit.gesturesMenu.moved",
    value: "moved",
    parents: ["microbit.whenGesture"],
  },
  {
    id: "microbit.gesturesMenu.shaken",
    value: "shaken",
    parents: ["microbit.whenGesture"],
  },
  {
    id: "microbit.tiltDirectionMenu.any",
    value: "any",
    parents: ["microbit.whenTilted", "microbit.isTilted"],
  },
  {
    id: "microbit.tiltDirectionMenu.back",
    value: "back",
    parents: ["microbit.whenTilted", "microbit.isTilted", "microbit.tiltAngle"],
  },
  {
    id: "microbit.tiltDirectionMenu.front",
    value: "front",
    parents: ["microbit.whenTilted", "microbit.isTilted", "microbit.tiltAngle"],
  },
  {
    id: "microbit.tiltDirectionMenu.left",
    value: "left",
    parents: ["microbit.whenTilted", "microbit.isTilted", "microbit.tiltAngle"],
  },
  {
    id: "microbit.tiltDirectionMenu.right",
    value: "right",
    parents: ["microbit.whenTilted", "microbit.isTilted", "microbit.tiltAngle"],
  },
  {
    id: "boost.motorDirection.backward",
    value: "that way",
    parents: ["boost.setMotorDirection"],
  },
  {
    id: "boost.motorDirection.forward",
    value: "this way",
    parents: ["boost.setMotorDirection"],
  },
  {
    id: "boost.motorDirection.reverse",
    value: "reverse",
    parents: ["boost.setMotorDirection"],
  },
  {
    id: "boost.color.any",
    value: "any color",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.black",
    value: "black",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.blue",
    value: "blue",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.green",
    value: "green",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.red",
    value: "red",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.white",
    value: "white",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.color.yellow",
    value: "yellow",
    parents: ["boost.whenColor", "boost.seeingColor"],
  },
  {
    id: "boost.tiltDirection.any",
    value: "any",
    parents: ["boost.whenTilted"],
  },
  {
    id: "boost.tiltDirection.up",
    value: "up",
    parents: ["boost.whenTilted", "boost.getTiltAngle"],
  },
  {
    id: "boost.tiltDirection.down",
    value: "down",
    parents: ["boost.whenTilted", "boost.getTiltAngle"],
  },
  {
    id: "boost.tiltDirection.left",
    value: "left",
    parents: ["boost.whenTilted", "boost.getTiltAngle"],
  },
  {
    id: "boost.tiltDirection.right",
    value: "right",
    parents: ["boost.whenTilted", "boost.getTiltAngle"],
  },
  {
    id: "wedo2.motorId.a",
    value: "motor A",
    parents: [
      "wedo2.motorOnFor",
      "wedo2.motorOn",
      "wedo2.motorOff",
      "wedo2.startMotorPower",
      "wedo2.setMotorDirection",
    ],
  },
  {
    id: "wedo2.motorId.b",
    value: "motor B",
    parents: [
      "wedo2.motorOnFor",
      "wedo2.motorOn",
      "wedo2.motorOff",
      "wedo2.startMotorPower",
      "wedo2.setMotorDirection",
    ],
  },
  {
    id: "wedo2.motorId.all",
    value: "all motors",
    parents: [
      "wedo2.motorOnFor",
      "wedo2.motorOn",
      "wedo2.motorOff",
      "wedo2.startMotorPower",
      "wedo2.setMotorDirection",
    ],
  },
  {
    id: "wedo2.motorId.default",
    value: "motor",
    parents: [
      "wedo2.motorOnFor",
      "wedo2.motorOn",
      "wedo2.motorOff",
      "wedo2.startMotorPower",
      "wedo2.setMotorDirection",
    ],
  },
  {
    id: "wedo2.motorDirection.forward",
    value: "this way",
    parents: ["wedo2.setMotorDirection"],
  },
  {
    id: "wedo2.motorDirection.backward",
    value: "that way",
    parents: ["wedo2.setMotorDirection"],
  },
  {
    id: "wedo2.motorDirection.reverse",
    value: "reverse",
    parents: ["wedo2.setMotorDirection"],
  },
  {
    id: "wedo2.tiltDirection.any",
    value: "any",
    parents: ["wedo2.whenTilted", "wedo2.isTilted"],
  },
  {
    id: "wedo2.tiltDirection.up",
    value: "up",
    parents: ["wedo2.whenTilted", "wedo2.isTilted", "wedo2.getTiltAngle"],
  },
  {
    id: "wedo2.tiltDirection.down",
    value: "down",
    parents: ["wedo2.whenTilted", "wedo2.isTilted", "wedo2.getTiltAngle"],
  },
  {
    id: "wedo2.tiltDirection.left",
    value: "left",
    parents: ["wedo2.whenTilted", "wedo2.isTilted", "wedo2.getTiltAngle"],
  },
  {
    id: "wedo2.tiltDirection.right",
    value: "right",
    parents: ["wedo2.whenTilted", "wedo2.isTilted", "wedo2.getTiltAngle"],
  },
  {
    id: "gdxfor.pulled",
    value: "pulled",
    parents: ["gdxfor.whenForcePushedOrPulled"],
  },
  {
    id: "gdxfor.pushed",
    value: "pushed",
    parents: ["gdxfor.whenForcePushedOrPulled"],
  },
  { id: "gdxfor.shaken", value: "shaken", parents: ["gdxfor.whenGesture"] },
  {
    id: "gdxfor.startedFalling",
    value: "started falling",
    parents: ["gdxfor.whenGesture"],
  },
  {
    id: "gdxfor.turnedFaceDown",
    value: "turned face down",
    parents: ["gdxfor.whenGesture"],
  },
  {
    id: "gdxfor.turnedFaceUp",
    value: "turned face up",
    parents: ["gdxfor.whenGesture"],
  },
  {
    id: "gdxfor.tiltDirectionMenu.front",
    value: "front",
    parents: ["gdxfor.whenTilted", "gdxfor.isTilted", "gdxfor.getTilt"],
  },
  {
    id: "gdxfor.tiltDirectionMenu.back",
    value: "back",
    parents: ["gdxfor.whenTilted", "gdxfor.isTilted", "gdxfor.getTilt"],
  },
  {
    id: "gdxfor.tiltDirectionMenu.left",
    value: "left",
    parents: ["gdxfor.whenTilted", "gdxfor.isTilted", "gdxfor.getTilt"],
  },
  {
    id: "gdxfor.tiltDirectionMenu.right",
    value: "right",
    parents: ["gdxfor.whenTilted", "gdxfor.isTilted", "gdxfor.getTilt"],
  },
  {
    id: "gdxfor.tiltDirectionMenu.any",
    value: "any",
    parents: ["gdxfor.whenTilted", "gdxfor.isTilted"],
  },
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
    localeDropdowns[`translate.language.${info.code}`] = {
      value: info.name,
      parents: ["translate.translateBlock"],
    }
  })
  getSpokenLanguageMenu(lang, languageNames, localeNames).forEach(info => {
    if (scratchSpokenLanguageCodes.includes(info.value)) {
      localeDropdowns[`text2speech.language.${info.value}`] = {
        value: info.text,
        parents: ["text2speech.setLanguageBlock"],
      }
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
  raw.forEach((value, index) => {
    result[`makeymakey.sequence.${index}`] = {
      value: value
        .replaceAll("left", dropdowns["makeymakey.leftArrowShort"].value)
        .replaceAll("right", dropdowns["makeymakey.rightArrowShort"].value)
        .replaceAll("up", dropdowns["makeymakey.upArrowShort"].value)
        .replaceAll("down", dropdowns["makeymakey.downArrowShort"].value),
      parents: ["makeymakey.whenKeysPressedInOrder"],
    }
  })
  return result
}

export function getDropdowns() {
  dropdowns.forEach(item => {
    if (!item.parents) {
      if (item.id.startsWith("music.drum")) {
        item.parents = ["music.playDrumForBeats"]
      } else if (item.id.startsWith("music.instrument")) {
        item.parents = ["music.setInstrument"]
      } else {
        const idx = item.id.lastIndexOf("_")
        const parent = idx !== -1 ? item.id.substring(0, idx) : null
        item.parents = parent ? [parent] : null
      }
    }
  })
  return dropdowns
}
