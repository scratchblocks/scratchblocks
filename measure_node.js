var Canvas = require('canvas')

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = new Canvas());
    var context = canvas.getContext("2d");
    context.font = '12px ' + font;
    var metrics = context.measureText(text);
    return metrics.width;
}

var fonts = [
  'Lucida Grande', 'Verdana', 'Arial', 'DejaVu Sans', 'sans-serif',
  'Helevetica', 'Arial', 'DejaVu Sans', 'sans-serif'
]

console.log(fonts.map(font => getTextWidth('§a', font)))
