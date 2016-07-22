var fs = require('fs');
var path = require('path');
var fork = require('child_process').fork;

/**
 * Arguments
 *
 * ./package_translations [language code | all]
 *
 * No arguments will fetch and package forum languages.
 */
var args = process.argv;
var fetch = fork(__dirname + '/fetch_translations.js', args.slice(2));

fetch.on('close', (code) => {
  if (code !== 0) {
    console.log('fetch failed');
    process.exit(1);
  }

  var filename = __dirname + '/../browser/translations';
  filename += args[2] ? '-' + args[2] : '';
  filename += '.js';
  filename = path.normalize(filename);
  console.log(`writing translations to ${filename}`);

  var locales = 'scratchblocks.loadLanguages(' + getLocales() + ');';
  fs.writeFileSync(filename, locales);
});

function getLocales () {
  var locales = fs.readdirSync(__dirname + '/locales/')
    .filter(f => f.search(/\.json$/) !== -1)
    .map(f => __dirname + '/locales/' + f)
    .map((filename) => fs.readFileSync(filename, 'utf8'))
    .map(JSON.parse)
    .reduce((obj, locale) => Object.assign(obj, locale), {});
  return JSON.stringify(locales, null, 2);
}
