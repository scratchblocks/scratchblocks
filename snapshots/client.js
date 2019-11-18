const scratchblocks = require('../browser');

scratchblocks.loadLanguages({
  de: require('../locales/de.json'),
});

window.render = function(source, options, scale) {
  const doc = scratchblocks.parse(source, {
    languages: options.lang ? ['en', options.lang] : ['en'],
  });

  const view = scratchblocks.newView(doc, {
    style: options.style,
  });
  view.render();

  return new Promise(function(resolve) {
    view.toCanvas(function(canvas) {
      resolve(canvas.toDataURL('image/png'));
    }, scale);
  });
};
