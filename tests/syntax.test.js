const { parse, loadLanguages, allLanguages } = require('../syntax');

loadLanguages({
  de: require('../locales/de'),
  ja: require('../locales/ja'),
});
const optionsDe = {
  languages: ['en', 'de'],
};
const optionsJa = {
  languages: ['en', 'ja'],
};

function getScript(doc) {
  expect(doc.scripts.length).toBe(1);
  return doc.scripts[0];
}

function parseScript(code, options) {
  return getScript(parse(code, options));
}

function parseBlock(code, options) {
  let script = getScript(parse(code, options));
  expect(script.blocks.length).toBe(1);
  return script.blocks[0];
}

/* * */

describe('blocks with symbols', () => {
  const flag = {
    shape: 'hat',
    category: 'events',
    selector: 'whenGreenFlag',
  };

  test('when flag clicked', () => {
    expect(parseBlock('when @greenFlag clicked').info).toMatchObject(flag);
    expect(parseBlock('when green flag clicked').info).toMatchObject(flag);
    expect(parseBlock('when flag clicked').info).toMatchObject(flag);
    expect(parseBlock('when gf clicked').info).toMatchObject(flag);
  });

  test('when flag clicked: de', () => {
    expect(parseBlock('Wenn die grüne Flagge angeklickt', optionsDe).info).toMatchObject(flag);
    expect(parseBlock('Wenn ⚑ angeklickt wird', optionsDe).info).toMatchObject(flag);
    expect(parseBlock('Wenn @greenFlag angeklickt wird', optionsDe).info).toMatchObject(flag);
  });

  test('when flag clicked: ja', () => {
    expect(parseBlock('⚑ が押されたとき', optionsJa).info).toMatchObject(flag);
  });

  const turnLeft = {
    selector: 'turnLeft:',
    shape: 'stack',
    category: 'motion',
  };

  test('turn left', () => {
    expect(parseBlock('turn ccw (15) degrees').info).toMatchObject(turnLeft);
    expect(parseBlock('turn left (15) degrees').info).toMatchObject(turnLeft);
    expect(parseBlock('turn @turnLeft (15) degrees').info).toMatchObject(turnLeft);
  });

  test('turn left: de', () => {
    expect(parseBlock('drehe dich nach links um (15) Grad', optionsDe).info).toMatchObject(turnLeft);
    expect(parseBlock('drehe dich ↺ um (15) Grad', optionsDe).info).toMatchObject(turnLeft);
    expect(parseBlock('drehe dich @turnLeft um (15) Grad', optionsDe).info).toMatchObject(turnLeft);
  });

  const turnRight = {
    selector: 'turnRight:',
    shape: 'stack',
    category: 'motion',
  };

  test('turn right', () => {
    expect(parseBlock('turn cw (15) degrees').info).toMatchObject(turnRight);
    expect(parseBlock('turn right (15) degrees').info).toMatchObject(turnRight);
    expect(parseBlock('turn @turnRight (15) degrees').info).toMatchObject(turnRight);
  });

  test('turn right: de', () => {
    expect(parseBlock('drehe dich nach rechts um (15) Grad', optionsDe).info).toMatchObject(turnRight);
    expect(parseBlock('drehe dich ↻ um (15) Grad', optionsDe).info).toMatchObject(turnRight);
    expect(parseBlock('drehe dich @turnRight um (15) Grad', optionsDe).info).toMatchObject(turnRight);
  });
});

describe('literals', () => {
  test('can be parsed', () => {
    const b = parseBlock('say [Hello!] for (2) secs');
    expect(b.children[1].isInput).toBe(true);
    expect(b.children[3].isInput).toBe(true);
  });

  // test('numbers can be scientific', () => {
  //   testBlock('change [foo v] by (2e-50)', ['changeVar:by:', 'foo', 2e-50])
  // })

  test('variables are not numbers', () => {
    const b = parseBlock('say [Hello!] for (foo) secs');
    expect(b.children[3].info).toMatchObject({
      category: 'variables',
    });
  });

  test('strings can be backslash-escaped', () => {
    const b = parseBlock('say [hello \\] world]');
    expect(b.children[1].isInput).toBe(true);
    expect(b.children[1].value).toBe('hello ] world');
  });

  test('labels can contain backslashes', () => {
    var code = 'foo \\]';
    expect(parseBlock(code).stringify()).toBe(code);
    // var code = 'foo ]' // TODO don't escape lone slashes
    // expect(parseBlock(code).stringify()).toBe(code)
  });
});

describe('color literals', () => {
  test('work', () => {
    const b = parseBlock('<touching color [#f0f] ?>');
    expect(b.children[2].shape).toBe('color');
    expect(b.children[2].value).toBe('#f0f');
  });

  test('can be round', () => {
    const b = parseBlock('<touching color (#f0f) ?>');
    expect(b.children[2].shape).toBe('color');
    expect(b.children[2].value).toBe('#f0f');
  });
});

describe('recognise lists', () => {
  const variable = {
    category: 'variables',
    selector: 'readVariable',
  };

  test('not a list', () => {
    const b = parseBlock('say (list)');
    expect(b.children[1].info).toMatchObject(variable);
  });

  const list = {
    category: 'list',
    selector: 'contentsOfList:',
  };

  test('from add command', () => {
    const s = parseScript('say (list)\nadd [x] to [list v]');
    const b = s.blocks[0];
    expect(b.children[1].info).toMatchObject(list);
  });

  test('from insert command', () => {
    const s = parseScript('say (list)\ninsert [x] at (99 v) of [list v]');
    const b = s.blocks[0];
    expect(b.children[1].info).toMatchObject(list);
  });

  test('from show command', () => {
    const s = parseScript('say (list)\nshow list [list v]');
    const b = s.blocks[0];
    expect(b.children[1].info).toMatchObject(list);
  });
});

describe('disambiguation', () => {
  const stringLength = {
    category: 'operators',
    selector: 'stringLength:',
  };

  test('green: length of string', () => {
    expect(parseBlock('(length of [world])').info).toMatchObject(stringLength);
    expect(parseBlock('(length of (foo))').info).toMatchObject(stringLength);
  });

  const lineCount = {
    category: 'list',
    selector: 'lineCountOfList:',
  };

  test('orange: length of list', () => {
    expect(parseBlock('(length of [list v])').info).toMatchObject(lineCount);
  });

  const mathFunc = {
    category: 'operators',
    selector: 'computeFunction:of:',
  };

  test('green: math op', () => {
    expect(parseBlock('([sqrt v] of (9))').info).toMatchObject(mathFunc);
    expect(parseBlock('([sqrt v] of (foo))').info).toMatchObject(mathFunc);
    expect(parseBlock('([e ^ v] of (20))').info).toMatchObject(mathFunc);
  });

  const attributeOf = {
    category: 'sensing',
    selector: 'getAttribute:of:',
  };

  test('blue: attribute of', () => {
    expect(parseBlock('([x position v] of [Sprite1 v])').info).toMatchObject(attributeOf);
    expect(parseBlock('([x position v] of (foo))').info).toMatchObject(attributeOf);
    // invalid --not a math function
    expect(parseBlock('([e^ v] of (9)').info).toMatchObject(attributeOf);
  });

  const setGraphicEffect = {
    category: 'looks',
    id: 'LOOKS_SETEFFECTTO',
  };

  const changeGraphicEffect = {
    category: 'looks',
    id: 'LOOKS_CHANGEEFFECTBY',
  };

  test('looks: graphic effects', () => {
    expect(parseBlock('set [ghost v] effect to (100)').info).toMatchObject(setGraphicEffect);
    expect(parseBlock('change [ghost v] effect by (5)').info).toMatchObject(changeGraphicEffect);
  });

  test('looks: graphic effects: de', () => {
    expect(parseBlock('setze Effekt [Farbe v] auf (100)', optionsDe).info).toMatchObject(setGraphicEffect);
  });

  const setSoundEffect = {
    category: 'sound',
    id: 'SOUND_SETEFFECTO',
  };
  const changeSoundEffect = {
    category: 'sound',
    id: 'SOUND_CHANGEEFFECTBY',
  };

  test('sound: sound effects', () => {
    expect(parseBlock('set [pitch v] effect to (100)').info).toMatchObject(setSoundEffect);
    expect(parseBlock('set [pan left/right v] effect to (100)').info).toMatchObject(setSoundEffect);
    expect(parseBlock('change [pitch v] effect by (5)').info).toMatchObject(changeSoundEffect);
  });

  test('sound: sound effects: de', () => {
    expect(parseBlock('setze Effekt [Höhe v] auf (100)', optionsDe).info).toMatchObject(setSoundEffect);
    expect(parseBlock('setze Effekt [Hohe v] auf (100)', optionsDe).info).toMatchObject(setSoundEffect);
  });

  const listContains = {
    category: 'list',
    selector: 'list:contains:',
  };

  test('red: list contains', () => {
    expect(parseBlock('<[list v] contains [f] ?>').info).toMatchObject(listContains);
  });

  const stringContains = {
    category: 'operators',
    id: 'OPERATORS_CONTAINS',
  };

  test('green: string contains', () => {
    expect(parseBlock('<[foo] contains [f] ?>').info).toMatchObject(stringContains);
    expect(parseBlock('<(foo) contains [f] ?>').info).toMatchObject(stringContains);
  });

  // TODO test all disambiguations for other languages

  const stopCap = {
    shape: 'cap',
    selector: 'stopScripts',
  };

  test('stop block cap', () => {
    expect(parseBlock('stop [all v]').info).toMatchObject(stopCap);
  });

  test('stop block cap: de', () => {
    expect(parseBlock('stoppe [alles v]', optionsDe).info).toMatchObject(stopCap);
  });

  const stopStack = {
    shape: 'stack',
    selector: 'stopScripts',
  };

  test('stop block stack', () => {
    expect(parseBlock('stop [other scripts in sprite v]').info).toMatchObject(stopStack);
  });

  test('stop block stack: de', () => {
    expect(parseBlock('stoppe [andere Skripte der Figur v]', optionsDe).info).toMatchObject(stopStack);
  });
});

describe('standalone blocks', () => {
  test('reporters may stand alone', () => {
    expect(parseBlock('(variable)').info.shape).toBe('reporter');
    expect(parseBlock('<loud?>').info.shape).toBe('boolean');
  });

  test('standalone inputs get put in stack block', () => {
    expect(parseBlock('[cheesecake]').info.shape).toBe('stack');
    expect(parseBlock('(3.12)').info.shape).toBe('stack');
    expect(parseBlock('(menu v)').info.shape).toBe('stack');
    expect(parseBlock('[dropdown v]').info.shape).toBe('stack');
  });

  test('stack blocks always stand alone', () => {
    expect(parseBlock('stamp').info.shape).toBe('stack');
    expect(parseBlock('say [hi]').info.shape).toBe('stack');
    expect(parseBlock('[thing] (123) (variable)').info.shape).toBe('stack');
    // expect(parseBlock('[attribute v] of [Stage v]').info.shape).toBe('stack') // oops v3 changed this
  });
});

describe('c blocks', () => {
  const ifBlock = {
    selector: 'doIf',
  };

  test('if else', () => {
    // We used to give these different IDs for toJSON(); we no longer need to.
    expect(parseBlock('if <> then \n  \nend').info).toMatchObject(ifBlock);
    expect(parseBlock('if <> then \n  \nelse\nend').info).toMatchObject(ifBlock);
  });

  test('standalone else', () => {
    expect(parseBlock('else').info.shape).toBe('stack');
    expect(parseBlock('end').info.shape).toBe('stack');
  });
});

describe('comparison ops: < and > ', () => {
  test('ahahahaha', () => {
    expect(parseBlock('<[10]<(foo)>').info.selector).toBe('<');
    expect(parseBlock('<[10]<[11]>').info.selector).toBe('<');
    expect(parseBlock('<(foo)<(foo)>').info.selector).toBe('<');
    expect(parseBlock('<(foo)<[11]>').info.selector).toBe('<');
    expect(parseBlock('<[10]>(foo)>').info.selector).toBe('>');
    expect(parseBlock('<[10]>[11]>').info.selector).toBe('>');
    expect(parseBlock('<(foo)>(foo)>').info.selector).toBe('>');
    expect(parseBlock('<(foo)>[11]>').info.selector).toBe('>');
    expect(parseBlock('<<><<>>').info.selector).toBe('<');
    expect(parseBlock('<<>><>>').info.selector).toBe('>');
  });

  // TODO add that test case from that issue
});

// Test that blocks renamed between Scratch 2 and Scratch 3 work in either form.
describe('renamed blocks', () => {
  const say = {
    selector: 'say:duration:elapsed:from:',
  };

  test('say for secs', () => {
    expect(parseBlock('say [Hello!] for (2) secs').info).toMatchObject(say);
    expect(parseBlock('say [Hello!] for (2) seconds').info).toMatchObject(say);
  });

  const think = {
    selector: 'think:duration:elapsed:from:',
  };

  test('think for secs', () => {
    expect(parseBlock('think [Hmm...] for (2) secs').info).toMatchObject(think);
    expect(parseBlock('think [Hmm...] for (2) seconds').info).toMatchObject(think);
  });

  const playSound = {
    selector: 'playSound:',
  };

  test('play sound', () => {
    expect(parseBlock('play sound [moo v]').info).toMatchObject(playSound);
    expect(parseBlock('start sound [moo v]').info).toMatchObject(playSound);
  });

  const eraseAll = {
    selector: 'clearPenTrails',
  };

  test('clear', () => {
    expect(parseBlock('clear').info).toMatchObject(eraseAll);
    expect(parseBlock('erase all').info).toMatchObject(eraseAll);
  });

  const wait = {
    selector: 'wait:elapsed:from:',
  };

  test('wait secs', () => {
    expect(parseBlock('wait (1) secs').info).toMatchObject(wait);
    expect(parseBlock('wait (1) seconds').info).toMatchObject(wait);
  });

  const setTempo = {
    selector: 'setTempoTo:',
  };

  test('set tempo', () => {
    expect(parseBlock('set tempo to (120) bpm').info).toMatchObject(setTempo);
    expect(parseBlock('set tempo to (120)').info).toMatchObject(setTempo);
  });
});

describe('translate', () => {
  const optionsDe = {
    languages: ['en', 'de'],
  };

  test('reorders arguments: en -> de', () => {
    const b = parseBlock('go [back v] (1) layers');
    b.translate(allLanguages.de);
    expect(b.stringify()).toEqual('gehe (1) Ebenen [back v]');
  });

  test('reorders arguments: de -> en', () => {
    const b = parseBlock('gehe (1) Ebenen [back v]', optionsDe);
    b.translate(allLanguages.en);
    expect(b.stringify()).toEqual('go [back v] (1) layers');
  });

  test('turn left: en -> de', () => {
    const b = parseBlock('turn cw (45) degrees');
    b.translate(allLanguages.de);
    expect(b.stringify()).toEqual('drehe dich nach rechts um (45) Grad');
  });

  test('turn left: de -> en', () => {
    const b = parseBlock('drehe dich nach rechts um (45) Grad', optionsDe);
    b.translate(allLanguages.en);
    expect(b.stringify()).toEqual('turn cw (45) degrees');
  });

  test('c blocks', () => {
    const b = parseBlock('forever\nmove (10) steps\nend');
    b.translate(allLanguages.de);
    expect(b.stringify()).toEqual('wiederhole fortlaufend \n  gehe (10) er Schritt\nend');
  });

  test('if else: en -> de', () => {
    const b = parseBlock('if <> then\n  stamp\nelse\n  clear\nend');
    b.translate(allLanguages.de);
    expect(b.stringify()).toEqual('falls <> , dann \n  hinterlasse Abdruck\nsonst \n  lösche alles\nend');
  });

  test('when flag clicked: en -> de', () => {
    const b = parseBlock('when flag clicked');
    b.translate(allLanguages.de);
    expect(b.stringify()).toEqual('Wenn die grüne Flagge angeklickt');
  });

  test('when flag clicked: en -> ja', () => {
    const b = parseBlock('when flag clicked');
    b.translate(allLanguages.ja);
    expect(b.stringify()).toEqual('⚑ が押されたとき');
  });

  // TODO test define

  // TODO translate end
});

// TODO test { } handling
