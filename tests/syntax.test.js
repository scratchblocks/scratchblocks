
const { parse, fromJSON } = require('../syntax')

function getBlock(doc) {
  expect(doc.scripts.length).toBe(1)
  let script = doc.scripts[0]
  expect(script.blocks.length).toBe(1)
  return script.blocks[0]
}

function parseBlock(code) {
  return getBlock(parse(code))
}

function blockFromJSON(json) {
  let obj = {
    scripts: [
      [0, 0, [json]],
    ],
  }
  return getBlock(fromJSON(obj))
}

function testBlock(code, json) {
  let fromCode = parseBlock(code)
  expect(fromCode.toJSON()).toEqual(json)
  //expect(fromCode.stringify()).toBe(code)
  let fromJSON = blockFromJSON(json)
  expect(fromJSON.stringify()).toBe(code)
  //expect(fromJSON.toJSON()).toEqual(json)
  return fromCode
}

/* * */

let getFoo = ['readVariable', 'foo']

describe('blocks with symbols', () => {

  test('when flag clicked', () => {
    let json = ['whenGreenFlag']
    testBlock('when green flag clicked', json)
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
  // TODO this is gonna be fun
})

describe('disambiguation', () => {
  test('green: length of string', () => {
    let b = testBlock('(length of [world])', ['stringLength:', 'world'])
    expect(b.info.category).toBe('operators')
    testBlock('(length of (foo))', ['stringLength:', getFoo])
  })

  test('orange: length of list', () => {
    let b = testBlock('(length of [list v] :: list)', ['lineCountOfList:', 'list'])
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

// TODO test { } handling

describe('other languages', () => {

  // scratchblocks.loadLanguages(scratchblocks.allLanguages.de)

  /*
  // German

  wenn die grune flagge angeklickt
  gehe (10) er-Schritt
  drehe dich nach rechts um (15) Grad

  // Spanish

  al presionar bandera verde
  por siempre
  girar a la izquierda (7) grados
  girar a la derecha (11) grados
  fin

  // Chinese

  点击绿旗时
  转动CCW (15)度
  转动CW (15)度
  如果 <声音响亮？> 那么
  结束

  // Polish

  kiedy kliknięto zieloną flagę
  obróć w lewo o (10) stopni
  obróć w prawo o (10) stopni
  forever
  koniec

  */
})
