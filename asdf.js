var chars = `
§!"#$%&/()=?\`
'1234567890+´
qwertyuiopå¨
QWERTYUIOPÅ^
asdfghjkløæ@ASDFGHJKLØÆ*
<zxvbnm,.-
>ZXCVBNM;:|`.replace(/\n/g, '');

var res = res || {}
function measureAll (i, extraChar) {
  extraChar = extraChar || ''
  var char = chars.charAt(i) + extraChar
  if (!char) return
  if (res[char] !== undefined) {
    print(char)
    measureAll(++i)
    return
  }

  measure(char)
    .then((r) => {
      r = r || {}
      res[char] = r.width || 0
      print(char)
    })
    .then(measureAll.bind(null, ++i, extraChar))
}

function measure (char) {
  return new Promise((resolve, reject) => {
    var doc = scratchblocks.parse(char)
    var label = doc.scripts[0].blocks[0].children[0]
    label.measure()
    scratchblocks.Label.endMeasuring(
      resolve.bind(null, label.metrics)
    )
  })
}

function print (char) {
  console.log(char + ': ' + res[char])
}

function checkCombinations (widths) {
  for (var key in widths) {
    if (key.length !== 2) continue
    var a = key.charAt(0)
    var b = key.charAt(1)
    var x = widths[a]
    var y = widths[b]
    if (x === undefined) {
      console.error(a + ' not found')
    }
    if (y === undefined) {
      console.error(b + ' not found')
    }
    if (widths[key] !== (x + y)) {
      console.error('MISMATCH: ' + key);
      console.error(widths[key] + '!==' + (x + y))
    }
  }
}

/**
 * Fonts
 * Label:
 *   Lucida Grande,Verdana,Arial,DejaVu Sans,sans-serif
 * Comment:
 *   Helevetica,Arial,DejaVu Sans,sans-serif
 */

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

var fonts = [
  'Lucida Grande', 'Verdana', 'Arial', 'DejaVu Sans', 'sans-serif',
  'Helevetica', 'Arial', 'DejaVu Sans', 'sans-serif'
]

fonts.map(font => getTextWidth('§a', font))
