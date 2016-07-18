/**
 * Removed from scratchblocks and copied here.
 *
 * TODO: rewrite as modules, in example:
 *
 *   var renderMatching = require('scratchblocks/src/renderMatching');
 *   renderMatching('pre.blocks');
 *
 */

/* Render all matching elements in page to shiny scratch blocks.
  * Accepts a CSS selector as an argument.
  *
  *  scratchblocks.renderMatching("pre.blocks");
  *
  * Like the old 'scratchblocks2.parse().
  */
var renderMatching = function (selector, options) {
  var selector = selector || "pre.blocks";
  var options = extend({
    inline: false,
    languages: ['en'],

    read: readCode, // function(el, options) => code
    parse: parse,   // function(code, options) => doc
    render: render, // function(doc) => svg
    replace: replace, // function(el, svg, doc, options)
  }, options);

  // find elements
  var results = [].slice.apply(document.querySelectorAll(selector));
  results.forEach(function(el) {
    var code = options.read(el, options);

    var doc = options.parse(code, options);

    var svg = options.render(doc);

    options.replace(el, svg, doc, options);
  });
};

// insert 'svg' into 'el', with appropriate wrapper elements
function replace(el, svg, scripts, options) {
  if (options.inline) {
    var container = document.createElement('span');
    var cls = "scratchblocks scratchblocks-inline";
    if (scripts[0] && !scripts[0].isEmpty) {
      cls += " scratchblocks-inline-" + scripts[0].blocks[0].shape;
    }
    container.className = cls;
    container.style.display = 'inline-block';
    container.style.verticalAlign = 'middle';
  } else {
    var container = document.createElement('div');
    container.className = "scratchblocks";
  }
  container.appendChild(svg);

  el.innerHTML = '';
  el.appendChild(container);
}

// read code from a DOM element
function readCode(el, options) {
  var options = extend({
    inline: false,
  }, options);

  var html = el.innerHTML.replace(/<br>\s?|\n|\r\n|\r/ig, '\n');
  var pre = document.createElement('pre');
  pre.innerHTML = html;
  var code = pre.textContent;
  if (options.inline) {
    code = code.replace('\n', '');
  }
  return code;
}

Document.prototype.exportSVG = function() {
  assert(this.el, "call draw() first");

  var style = makeStyle();
  this.el.appendChild(style);
  var xml = new XMLSerializer().serializeToString(this.el);
  this.el.removeChild(style);

  return 'data:image/svg+xml;utf8,' + xml.replace(
    /[#]/g, encodeURIComponent
  );
}

Document.prototype.exportPNG = function(cb) {
  var canvas = newCanvas();
  canvas.width = this.width;
  canvas.height = this.height;
  var context = canvas.getContext("2d");

  var image = new Image;
  image.src = this.exportSVG();
  image.onload = function() {
    context.drawImage(image, 0, 0);

    if (URL && URL.createObjectURL && Blob && canvas.toBlob) {
      var blob = canvas.toBlob(function(blob) {
        cb(URL.createObjectURL(blob));
      }, 'image/png');
    } else {
      cb(canvas.toDataURL('image/png'));
    }
  };
}

