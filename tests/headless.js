var fs = require('fs');
var scratchblocks = require('./..');

fs.readdirSync(__dirname)
  .filter(file => file.match(/\.txt$/))
  .map(file => __dirname + '/' + file)
  .map(file => ({ filename: file, content: fs.readFileSync(file, 'utf8') }))
  .map(test => Object.assign(test, { svg: scratchblocks.renderSVGString(test.content) }))
  .map(test => {
    var out = test.filename.replace('.txt', '.svg');
    fs.writeFileSync(out, test.svg);
  });
