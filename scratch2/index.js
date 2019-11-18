const SVG = require('./draw');
const blocks = require('./blocks');
const style = require('./style');

function init(window) {
  SVG.init(window);

  blocks.LabelView.measuring = (function() {
    const canvas = SVG.makeCanvas();
    return canvas.getContext('2d');
  })();
}

module.exports = {
  init: init,
  newView: blocks.newView,
  makeStyle: style.makeStyle,
};
