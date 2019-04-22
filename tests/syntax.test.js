
const { parse, fromJSON, loadLanguages, allLanguages } = require('../syntax')

loadLanguages({
  de: require('../locales/de'),
})
const optionsDe = {
  languages: ['en', 'de'],
}

function getScript(doc) {
  expect(doc.scripts.length).toBe(1)
  return doc.scripts[0]
}

function parseBlock(code, options) {
  let script = getScript(parse(code, options))
  expect(script.blocks.length).toBe(1)
  return script.blocks[0]
}

function scriptFromJSON(json, lang) {
  let obj = {
    scripts: [
      [0, 0, json],
    ],
  }
  return fromJSON(obj, lang)
}

function testScript(code, json, options) {
  let fromCode = getScript(parse(code, options))
  if (json === null) {
    expect(fromCode.stringify()).toBe(code)
  } else {
    expect(fromCode.toJSON()).toEqual(json)
    let fromJSON = scriptFromJSON(json, options && options.languages ? allLanguages[options.languages[1]] : null)
    expect(fromJSON.stringify()).toBe(code)
  }
  return fromCode
}

function testBlock(code, json, options) {
  let script = testScript(code, json === null ? null : [json], options)
  expect(script.blocks.length).toBe(1)
  return script.blocks[0]
}

/* * */

let getFoo = ['readVariable', 'foo']

describe('blocks with symbols', () => {

  test('when flag clicked', () => {
    let json = ['whenGreenFlag']
    testBlock('when green flag clicked', json)
    // 'when green flag clicked' is the default used by stringify(), so we
    // can't use testBlock for the other aliases.
    expect(parseBlock('when flag clicked').toJSON()).toEqual(json)
    expect(parseBlock('when gf clicked').toJSON()).toEqual(json)
  })

  test('turn left', () => {
    let json = ['turnLeft:', 15]
    testBlock('turn ccw (15) degrees', json)
    expect(parseBlock('turn left (15) degrees').toJSON()).toEqual(json)
    expect(parseBlock('turn @turnLeft (15) degrees').toJSON()).toEqual(json)
  })

  test('turn right', () => {
    let json = ['turnRight:', 15]
    testBlock('turn cw (15) degrees', json)
    expect(parseBlock('turn right (15) degrees').toJSON()).toEqual(json)
    expect(parseBlock('turn @turnRight (15) degrees').toJSON()).toEqual(json)
  })

  test('when flag clicked: de', () => {
    const json = ['whenGreenFlag']
    testBlock('Wenn die grüne Flagge angeklickt', json, optionsDe)
    expect(parseBlock('Wenn ⚑ angeklickt wird', optionsDe).toJSON()).toEqual(json)
    expect(parseBlock('Wenn @greenFlag angeklickt wird', optionsDe).toJSON()).toEqual(json)
  })

  test('turn left: de', () => {
    const json = ['turnLeft:', 15]
    testBlock('drehe dich nach links um (15) Grad', json, optionsDe)
    expect(parseBlock('drehe dich ↺ um (15) Grad', optionsDe).toJSON()).toEqual(json)
    expect(parseBlock('drehe dich @turnLeft um (15) Grad', optionsDe).toJSON()).toEqual(json)
  })

  test('turn right: de', () => {
    const json = ['turnRight:', 15]
    testBlock('drehe dich nach rechts um (15) Grad', json, optionsDe)
    expect(parseBlock('drehe dich ↻ um (15) Grad', optionsDe).toJSON()).toEqual(json)
    expect(parseBlock('drehe dich @turnRight um (15) Grad', optionsDe).toJSON()).toEqual(json)
  })

})

describe('literals', () => {
  test('broadly, they work', () => {
    testBlock('say [Hello!] for (2) secs', ['say:duration:elapsed:from:', 'Hello!', 2])
  })

  // test('numbers can be scientific', () => {
  //   testBlock('change [foo v] by (2e-50)', ['changeVar:by:', 'foo', 2e-50])
  // })

  test('variables are not numbers', () => {
    testBlock('say [Hello!] for (foo) secs', ['say:duration:elapsed:from:', 'Hello!', getFoo])
  })

  test('strings can be backslash-escaped', () => {
    testBlock('say [hello \\] world]', ['say:', 'hello ] world'])
  })

  test('labels can contain backslashes', () => {
    var code = 'foo \\]'
    expect(parseBlock(code).stringify()).toBe(code)
    // var code = 'foo ]' // TODO don't escape lone slashes
    // expect(parseBlock(code).stringify()).toBe(code)
  })

})

describe('color literals', () => {
  test('work', () => {
    let b = testBlock('<touching color [#f0f] ?>', ["touchingColor:", 16711935])
    const color = b.children[2]
    expect(color.shape).toBe('color')
    expect(color.value).toBe('#f0f')
  })

  test('can be round', () => {
    expect(parseBlock('<touching color (#f0f)?>').toJSON()).toEqual(["touchingColor:", 16711935])
  })
})

describe('recognise lists', () => {
  test('not a list', () => {
    testBlock('say (list)', ['say:', ['readVariable', 'list']])
  })

  test('from add command', () => {
    testScript('say (list)\nadd [x] to [list v]', [
      ['say:', ['contentsOfList:', 'list']],
      ['append:toList:', 'x', 'list'],
    ])
  })

  test('from insert command', () => {
    testScript('say (list)\ninsert [x] at (99 v) of [list v]', [
      ['say:', ['contentsOfList:', 'list']],
      ['insert:at:ofList:', 'x', 99, 'list'],
    ])
  })

  test('from show command', () => {
    testScript('say (list)\nshow list [list v]', [
      ['say:', ['contentsOfList:', 'list']],
      ['showList:', 'list'],
    ])
  })
})

describe('disambiguation', () => {
  test('green: length of string', () => {
    let b = testBlock('(length of [world])', ['stringLength:', 'world'])
    expect(b.info.category).toBe('operators')
    testBlock('(length of (foo))', ['stringLength:', getFoo])
  })

  test('orange: length of list', () => {
    let b = testBlock('(length of [list v])', ['lineCountOfList:', 'list'])
    expect(b.info.category).toBe('list')
  })

  test('green: math op', () => {
    let b = testBlock('([sqrt v] of (9))', ['computeFunction:of:', 'sqrt', 9])
    expect(b.info.category).toBe('operators')
    testBlock('([sqrt v] of (foo))', ['computeFunction:of:', 'sqrt', getFoo])
    testBlock('([e ^ v] of (20))', ['computeFunction:of:', 'e ^', 20])
  })

  test('blue: attribute of', () => {
    let b = testBlock('([x position v] of [Sprite1 v])', ['getAttribute:of:', 'x position', 'Sprite1'])
    expect(b.info.category).toBe('sensing')
    testBlock('([x position v] of (foo))', ['getAttribute:of:', 'x position', getFoo])

    // invalid --not a math function
    expect(parseBlock('([e^ v] of (9)').info.category).toBe('sensing')
  })

  test('looks: graphic effects', () => {
    let b = testBlock('set [ghost v] effect to (100)', ['setGraphicEffect:to:', 'ghost', 100])
    expect(b.info.category).toBe('looks')

    b = testBlock('change [ghost v] effect by (5)', ['changeGraphicEffect:by:', 'ghost', 5])
    expect(b.info.category).toBe('looks')
  })

  test('sound: sound effects', () => {
    let b = testBlock('set [pitch v] effect to (100)', ['sb3:SOUND_SETEFFECTO', 'pitch', 100])
    expect(b.info.category).toBe('sound')
    testBlock('set [pan left/right v] effect to (100)', ['sb3:SOUND_SETEFFECTO', 'pan left/right', 100])

    b = testBlock('change [pitch v] effect by (5)', ['sb3:SOUND_CHANGEEFFECTBY', 'pitch', 5])
    expect(b.info.category).toBe('sound')
  })

  test('red: list contains', () => {
    let b = testBlock('<[list v] contains [f] ?>', ['list:contains:', 'list', 'f'])
    expect(b.info.category).toBe('list')
  })

  test('green: string contains', () => {
    let b = testBlock('<[foo] contains [f] ?>', ['sb3:OPERATORS_CONTAINS', 'foo', 'f'])
    expect(b.info.category).toBe('operators')
    testBlock('<(foo) contains [f] ?>', ['sb3:OPERATORS_CONTAINS', ['readVariable', 'foo'], 'f'])
  })

  // TODO test disambiguation for other languages
})

describe('disambiguation', () => {
  test('stop block cap', () => {
    let b = testBlock('stop [all v]', ['stopScripts', 'all'])
    expect(b.info.shape).toBe('cap')
  })

  test('stop block stack', () => {
    let b = testBlock('stop [other scripts in sprite v]', ['stopScripts', 'other scripts in sprite'])
    expect(b.info.shape).toBe('stack')
  })

  test('stop block cap: de', () => {
    let b = testBlock('stoppe [alles v]', ['stopScripts', 'alles'], optionsDe)
    expect(b.info.shape).toBe('cap')
  })

  test('stop block stack: de', () => {
    let b = testBlock('stoppe [andere Skripte der Figur v]', ['stopScripts', 'andere Skripte der Figur'], optionsDe)
    expect(b.info.shape).toBe('stack')
  })
})

describe('standalone blocks', () => {
  test('reporters may stand alone', () => {
    expect(parseBlock('(variable)').info.shape).toBe('reporter')
    expect(parseBlock('<loud?>').info.shape).toBe('boolean')
  })

  test('standalone inputs get put in stack block', () => {
    expect(parseBlock('[cheesecake]').info.shape).toBe('stack')
    expect(parseBlock('(3.12)').info.shape).toBe('stack')
    expect(parseBlock('(menu v)').info.shape).toBe('stack')
    expect(parseBlock('[dropdown v]').info.shape).toBe('stack')
  })

  test('stack blocks always stand alone', () => {
    expect(parseBlock('stamp').info.shape).toBe('stack')
    expect(parseBlock('say [hi]').info.shape).toBe('stack')
    expect(parseBlock('[thing] (123) (variable)').info.shape).toBe('stack')
    // expect(parseBlock('[attribute v] of [Stage v]').info.shape).toBe('stack') // oops v3 changed this
  })
})

describe('c blocks', () => {
  test('if else', () => {
    testBlock('if <> then \n  \nelse\nend', ['doIfElse', false, [], []])
  })

  test('standalone else', () => {
    expect(parseBlock('else').info.shape).toBe('stack')
    expect(parseBlock('end').info.shape).toBe('stack')
  })
})

describe('comparison ops: < and > ', () => {
  test('ahahahaha', () => {
    expect(parseBlock('<[10]<(foo)>').toJSON()).toEqual(['<', '10', getFoo])
    expect(parseBlock('<[10]<[11]>').toJSON()).toEqual(['<', '10', '11'])
    expect(parseBlock('<(foo)<(foo)>').toJSON()).toEqual(['<', getFoo, getFoo])
    expect(parseBlock('<(foo)<[11]>').toJSON()).toEqual(['<', getFoo, '11'])
    expect(parseBlock('<[10]>(foo)>').toJSON()).toEqual(['>', '10', getFoo])
    expect(parseBlock('<[10]>[11]>').toJSON()).toEqual(['>', '10', '11'])
    expect(parseBlock('<(foo)>(foo)>').toJSON()).toEqual(['>', getFoo, getFoo])
    expect(parseBlock('<(foo)>[11]>').toJSON()).toEqual(['>', getFoo, '11'])
    expect(parseBlock('<<><<>>').toJSON()).toEqual(['<', false, false])
    expect(parseBlock('<<>><>>').toJSON()).toEqual(['>', false, false])
  })

  // TODO add that test case from that issue
})

// Test that blocks renamed between Scratch 2 and Scratch 3 work in either form.
describe('renamed blocks', () => {
  test('say for secs', () => {
    const json = ['say:duration:elapsed:from:', 'Hello!', 2]
    testBlock('say [Hello!] for (2) secs', json)
    // We can't use testBlock because the Scratch 2 wording is still (rightly!)
    // the default for fromJSON
    expect(parseBlock('say [Hello!] for (2) seconds').toJSON()).toEqual(json)
  })

  test('think for secs', () => {
    const json = ['think:duration:elapsed:from:', "Hmm...", 2]
    testBlock('think [Hmm...] for (2) secs', json)
    expect(parseBlock('think [Hmm...] for (2) seconds').toJSON()).toEqual(json)
  })

  test('play sound', () => {
    const json = ['playSound:', 'moo']
    testBlock('play sound [moo v]', json)
    expect(parseBlock('start sound [moo v]').toJSON()).toEqual(json)
  })

  test('clear', () => {
    const json = ['clearPenTrails']
    testBlock('clear', json)
    expect(parseBlock('erase all').toJSON()).toEqual(json)
  })

  test('wait secs', () => {
    const json = ['wait:elapsed:from:', 1]
    testBlock('wait (1) secs', json)
    expect(parseBlock('wait (1) seconds').toJSON()).toEqual(json)
  })

  test('set tempo', () => {
    const json = ['setTempoTo:', 120]
    testBlock('set tempo to (120) bpm', json)
    expect(parseBlock('set tempo to (120)').toJSON()).toEqual(json)
  })
})

describe('translate', () => {
  const optionsDe = {
    languages: ['en', 'de'],
  }

  test('reorders arguments: en -> de', () => {
    const b = parseBlock('go [back v] (1) layers')
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual('gehe (1) Ebenen [back v]')
  })

  test('reorders arguments: de -> en', () => {
    const b = parseBlock('gehe (1) Ebenen [back v]', optionsDe)
    b.translate(allLanguages.en)
    expect(b.stringify()).toEqual('go [back v] (1) layers')
  })

  test('turn left: en -> de', () => {
    const b = parseBlock('turn cw (45) degrees')
    b.translate(allLanguages.de)
    expect(b.stringify()).toEqual('drehe dich nach rechts um (45) Grad')
  })

  test('turn left: de -> en', () => {
    const b = parseBlock('drehe dich nach rechts um (45) Grad', optionsDe)
    b.translate(allLanguages.en)
    expect(b.stringify()).toEqual('turn cw (45) degrees')
  })
})

// TODO test { } handling

